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

class JobAutoCloseService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
  }

  // Start the automatic job closure service
  start() {
    if (this.isRunning) {
      console.log("Job auto-close service is already running");
      return;
    }

    console.log("Starting job auto-close service");
    this.isRunning = true;

    // Check immediately
    this.checkAndCloseExpiredJobs();

    // Set up periodic checking
    this.intervalId = setInterval(() => {
      this.checkAndCloseExpiredJobs();
    }, this.checkInterval);
  }

  // Stop the automatic job closure service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("Job auto-close service stopped");
  }

  // Check if a job should be automatically closed
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

  // Check if a job has any accepted applications
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
      console.error(`Error checking applications for job ${jobId}:`, error);
      return false; // Default to not closing if we can't check
    }
  }

  // Close a job automatically
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
        await set(ref(db, `users/${job.businessOwnerId}/notifications/${jobId}_auto_closed`), {
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
        });
      }

      console.log(`Successfully auto-closed job ${jobId}: ${job.jobTitle}`);
      return true;
    } catch (error) {
      console.error(`Error auto-closing job ${jobId}:`, error);
      return false;
    }
  }

  // Main function to check and close expired jobs
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

      // Process each job
      for (const [jobId, job] of Object.entries(allJobs)) {
        // Additional check: don't close if there are accepted applications
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
      }

      if (closedCount > 0) {
        console.log(`Auto-closed ${closedCount} jobs`);
      }
    } catch (error) {
      console.error("Error in checkAndCloseExpiredJobs:", error);
    }
  }

  // Manual check for testing purposes
  async manualCheck() {
    console.log("Manual job closure check initiated");
    await this.checkAndCloseExpiredJobs();
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      lastCheck: this.lastCheck,
    };
  }

  // Set custom check interval (in milliseconds)
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

// Create a singleton instance
const jobAutoCloseService = new JobAutoCloseService();

export default jobAutoCloseService;
