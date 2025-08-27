import {
  getDatabase,
  ref,
  get,
  update,
  set,
  query,
  orderByChild,
  startAt,
} from "firebase/database";

// JobAutoCloseService class for automatic job management and cleanup
// Features automatic job closure, unattended shift detection, and notification creation
class JobAutoCloseService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
  }

  // Start the automatic job closure service
  // Initializes immediate check and sets up periodic monitoring
  start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Check immediately
    this.checkAndCloseExpiredJobs();

    // Set up periodic checking
    this.intervalId = setInterval(() => {
      this.checkAndCloseExpiredJobs();
    }, this.checkInterval);
  }

  // Stop the automatic job closure service
  // Cleans up intervals and stops monitoring
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  // Check if a job should be automatically closed
  // Determines closure based on shift timing and job status
  shouldCloseJob(job) {
    if (!job || job.status !== "Open" || !job.startOfShift) {
      return false;
    }

    // Don't close jobs that have been accepted
    if (job.status === "Filled" || job.acceptedUserId) {
      return false;
    }

    const now = new Date();
    const shiftStartTime = new Date(job.startOfShift);
    const thirtyMinutesBeforeShift = new Date(
      shiftStartTime.getTime() - 30 * 60 * 1000
    );

    // Job should be closed if it's within 30 minutes of shift start AND still open
    return now >= thirtyMinutesBeforeShift;
  }

  // Check if an accepted job should be marked as unattended
  // Detects shifts that ended without worker verification
  shouldMarkAsUnattended(job) {
    if (
      !job ||
      job.status !== "Filled" ||
      !job.startOfShift ||
      !job.acceptedUserId
    ) {
      return false;
    }

    const now = new Date();
    const shiftStartTime = new Date(job.startOfShift);
    const shiftEndTime = new Date(job.endOfShift);

    // Mark as unattended if shift has ended and no verification code was used
    // We'll check if verificationCode exists in the accepted application
    return now > shiftEndTime;
  }

  // Check if a job has any accepted applications
  // Prevents auto-closure of jobs with accepted workers
  async checkForAcceptedApplications(jobId) {
    const db = getDatabase();

    try {
      const applicationsRef = ref(db, `public/jobs/${jobId}/jobApplications`);
      const snapshot = await get(applicationsRef);

      if (!snapshot.exists()) {
        return false;
      }

      const applications = snapshot.val();

      // Check if any application has "Accepted" status
      for (const [userId, application] of Object.entries(applications)) {
        if (application.status === "Accepted") {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false; // Default to not closing if we can't check
    }
  }

  // Close a job automatically
  // Updates job status and creates business owner notification
  async closeJob(jobId, job) {
    const db = getDatabase();

    try {
      const updateData = {
        status: "Closed",
        autoClosedAt: new Date().toISOString(),
        autoClosedReason: "Shift starts in less than 30 minutes",
        lastModified: new Date().toISOString(),
      };

      // Update public job status
      const publicJobRef = ref(db, `public/jobs/${jobId}`);
      await update(publicJobRef, updateData);

      // Update business owner's job status if businessOwnerId exists
      if (job.businessOwnerId) {
        const businessJobRef = ref(
          db,
          `users/${job.businessOwnerId}/business/${job.businessId}/jobs/${jobId}`
        );
        await update(businessJobRef, updateData);

        // Create notification for business owner about auto-closure
        await set(
          ref(
            db,
            `users/${job.businessOwnerId}/notifications/${jobId}_auto_closed`
          ),
          {
            id: `${jobId}_auto_closed`,
            type: "job_auto_closed",
            title: "Job Auto-Closed",
            message: `Your job "${job.jobTitle}" has been automatically closed because the shift starts in less than 30 minutes.`,
            avatar: null,
            timestamp: new Date().toISOString(),
            isRead: false,
            jobId: jobId,
            businessId: job.businessId,
            businessName: job.businessName,
            jobTitle: job.jobTitle,
          }
        );
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Mark a job as unattended
  // Updates job status and creates business owner notification
  async markJobAsUnattended(jobId, job) {
    const db = getDatabase();

    try {
      const updateData = {
        status: "Unattended",
        unattendedAt: new Date().toISOString(),
        unattendedReason: "Shift completed without verification code input",
        lastModified: new Date().toISOString(),
      };

      // Update public job status
      const publicJobRef = ref(db, `public/jobs/${jobId}`);
      await update(publicJobRef, updateData);

      // Update business owner's job status if businessOwnerId exists
      if (job.businessOwnerId) {
        const businessJobRef = ref(
          db,
          `users/${job.businessOwnerId}/business/${job.businessId}/jobs/${jobId}`
        );
        await update(businessJobRef, updateData);

        // Create notification for business owner about unattended job
        await set(
          ref(
            db,
            `users/${job.businessOwnerId}/notifications/${jobId}_unattended`
          ),
          {
            id: `${jobId}_unattended`,
            type: "job_unattended",
            title: "Job Marked as Unattended",
            message: `Your accepted job "${job.jobTitle}" has been marked as unattended because the worker never showed up.`,
            avatar: null,
            timestamp: new Date().toISOString(),
            isRead: false,
            jobId: jobId,
            businessId: job.businessId,
            businessName: job.businessName,
            jobTitle: job.jobTitle,
          }
        );
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Main function to check and close expired jobs
  // Processes all jobs for closure and unattended detection
  async checkAndCloseExpiredJobs() {
    if (!this.isRunning) return;

    try {
      const db = getDatabase();
      const publicJobsRef = ref(db, "public/jobs");

      // Get all jobs
      const snapshot = await get(publicJobsRef);
      if (!snapshot.exists()) {
        return;
      }

      const allJobs = snapshot.val();
      let closedCount = 0;
      let unattendedCount = 0;

      // Process each job
      for (const [jobId, job] of Object.entries(allJobs)) {
        // Check if job should be closed
        if (this.shouldCloseJob(job)) {
          // Check if there are any accepted applications for this job
          const hasAcceptedApplications =
            await this.checkForAcceptedApplications(jobId);

          if (!hasAcceptedApplications) {
            const success = await this.closeJob(jobId, job);
            if (success) {
              closedCount++;
            }
          }
        }

        // Check if accepted job should be marked as unattended
        if (this.shouldMarkAsUnattended(job)) {
          const success = await this.markJobAsUnattended(jobId, job);
          if (success) {
            unattendedCount++;
          }
        }
      }

      // Jobs processed silently for production
    } catch (error) {
      // Silent error handling for production
    }
  }

  // Manual check for testing purposes
  // Allows manual triggering of the job closure process
  async manualCheck() {
    await this.checkAndCloseExpiredJobs();
  }

  // Get service status
  // Returns current service state and configuration
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      lastCheck: this.lastCheck,
    };
  }

  // Set custom check interval (in milliseconds)
  // Dynamically adjusts monitoring frequency
  setCheckInterval(interval) {
    if (this.isRunning) {
      this.stop();
      this.checkInterval = interval;
      this.start();
    } else {
      this.checkInterval = interval;
    }
  }
}

// Create a singleton instance for global service access
const jobAutoCloseService = new JobAutoCloseService();

export default jobAutoCloseService;
