import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getDatabase, ref, onValue, get } from "firebase/database";
import Breadcrumb from "../../components/UI/Breadcrumb";
import {
  CalendarIcon,
  ClockIcon,
  CurrencyPoundIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BriefcaseIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

// UserHome component for displaying comprehensive user dashboard
// Features statistics, upcoming shifts, earnings summary, and business overview
const UserHome = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalHours: 0,
    jobsCompleted: 0,
    totalEarnings: 0,
    onTimeRate: 0,
    completionRate: 0,
    appliedJobsCount: 0,
    businessJobListings: 0,
    pendingApplications: 0,
    totalBusinessJobs: 0,
    totalBusinessApplications: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const db = getDatabase();

    // Fetch user's profile data
    const userProfileRef = ref(db, `users/${currentUser.uid}/profile`);
    onValue(userProfileRef, (profileSnapshot) => {
      if (profileSnapshot.exists()) {
        const profileData = profileSnapshot.val();
        console.log("Fetched profile data:", profileData); // Debug log

        // Update stats with profile data
        setStats((prevStats) => ({
          ...prevStats,
          totalHours: profileData.totalHoursWorked || 0,
          jobsCompleted: profileData.shiftCount || 0,
          // Calculate earnings based on profile data for consistency
          totalEarnings: profileData.totalHoursWorked
            ? profileData.totalHoursWorked * 12.5
            : 0, // Assuming £12.50/hour based on your job data
        }));
      } else {
        console.log("No profile data found"); // Debug log
      }
    });

    // Fetch user's job data - navigate to the applied jobs
    const userJobsRef = ref(db, `users/${currentUser.uid}/jobs/applied`);
    onValue(userJobsRef, (snapshot) => {
      if (snapshot.exists()) {
        const jobsData = snapshot.val();
        console.log("Fetched jobs data:", jobsData); // Debug log
        getRecentJobs(jobsData);
      } else {
        console.log("No jobs data found"); // Debug log
      }
    });

    // Fetch public jobs to calculate earnings from accepted jobs and get upcoming shifts
    const publicJobsRef = ref(db, `public/jobs`);
    onValue(publicJobsRef, (publicSnapshot) => {
      if (publicSnapshot.exists()) {
        const publicJobsData = publicSnapshot.val();
        console.log("Fetched public jobs data:", publicJobsData); // Debug log
        console.log(
          "Number of public jobs:",
          Object.keys(publicJobsData).length
        ); // Debug log

        // Log each job to see the structure
        Object.entries(publicJobsData).forEach(([jobId, job]) => {
          console.log(`Job ${jobId}:`, job);
          if (job.acceptedUserId === currentUser?.uid) {
            console.log(`Found job accepted by current user:`, job);
          }
        });

        calculateStats(publicJobsData);
        getUpcomingShifts(publicJobsData); // Get upcoming shifts from accepted jobs
      } else {
        console.log("No public jobs data found"); // Debug log
      }
    });

    // Set loaded state after initial data fetch
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [currentUser]);

  const calculateStats = (jobsData) => {
    let totalEarnings = 0;
    let onTimeCount = 0;
    let totalJobs = 0;
    let appliedJobsCount = 0;
    let businessJobListings = 0;
    let pendingApplications = 0;
    let totalBusinessJobs = 0;
    let totalBusinessApplications = 0;

    Object.values(jobsData).forEach((job) => {
      // Count all jobs this user has applied to
      if (job.userId === currentUser?.uid) {
        appliedJobsCount++;

        // Count pending applications (jobs with no status or pending status)
        if (
          !job.status ||
          job.status === "pending" ||
          job.status === "Pending"
        ) {
          pendingApplications++;
        }
      }

      // Only process jobs where this user was accepted
      if (job.acceptedUserId === currentUser?.uid) {
        // Check if job is completed
        if (
          job.status === "completed" ||
          job.status === "Completed" ||
          job.status === "filled" ||
          job.status === "Filled" ||
          job.status === "accepted" ||
          job.status === "Accepted"
        ) {
          // Calculate earnings from accepted pay rate and times
          if (
            job.acceptedPayRate &&
            job.acceptedStartTime &&
            job.acceptedEndTime
          ) {
            const startTime = new Date(job.acceptedStartTime);
            const endTime = new Date(job.acceptedEndTime);
            const durationHours = (endTime - startTime) / (1000 * 60 * 60);
            const earnings = parseFloat(job.acceptedPayRate) * durationHours;
            totalEarnings += earnings;
            console.log(
              `Job earnings: £${earnings} (${durationHours}h × £${job.acceptedPayRate}/h)`
            ); // Debug log
          }
        }

        if (job.status) totalJobs++;
        // For now, assume all jobs are on time since we don't have this field yet
        onTimeCount = totalJobs;
      }

      // Count business job listings (jobs created by this user's business)
      if (job.businessOwnerId === currentUser?.uid) {
        totalBusinessJobs++; // Count all jobs posted by this user

        // Only count active jobs (not completed, filled, or closed)
        if (
          job.status !== "completed" &&
          job.status !== "Completed" &&
          job.status !== "filled" &&
          job.status !== "Filled" &&
          job.status !== "closed" &&
          job.status !== "Closed"
        ) {
          businessJobListings++;
        }
      }

      // Count total applications to business jobs (if user owns the business)
      if (job.businessOwnerId === currentUser?.uid && job.jobApplications) {
        totalBusinessApplications += Object.keys(job.jobApplications).length;
      }
    });

    console.log("Total earnings calculated:", totalEarnings); // Debug log
    console.log("Profile hours:", stats.totalHours); // Debug log

    setStats((prevStats) => ({
      ...prevStats, // Keep profile data (totalHours, jobsCompleted, totalEarnings)
      // Don't overwrite totalEarnings - keep the profile-based calculation
      onTimeRate:
        totalJobs > 0 ? Math.round((onTimeCount / totalJobs) * 100) : 0,
      completionRate:
        totalJobs > 0
          ? Math.round((prevStats.jobsCompleted / totalJobs) * 100)
          : 0,
      appliedJobsCount,
      businessJobListings,
      pendingApplications,
      totalBusinessJobs,
      totalBusinessApplications,
    }));
  };

  const getRecentJobs = (jobsData) => {
    const recent = Object.values(jobsData)
      .filter((job) => job.status === "completed" || job.status === "Completed")
      .sort(
        (a, b) =>
          new Date(b.completedAt || b.endDate) -
          new Date(a.completedAt || a.endDate)
      )
      .slice(0, 3);
    setRecentJobs(recent);
  };

  const getUpcomingShifts = (jobsData) => {
    const now = new Date();
    console.log("getUpcomingShifts called with data:", jobsData); // Debug log
    console.log("Current user ID:", currentUser?.uid); // Debug log

    const upcoming = Object.values(jobsData)
      .filter((job) => {
        console.log("Checking job:", job); // Debug log for each job
        console.log("Job acceptedUserId:", job.acceptedUserId); // Debug log
        console.log("Job status:", job.status); // Debug log
        console.log("Job acceptedStartTime:", job.acceptedStartTime); // Debug log

        return (
          job.acceptedUserId === currentUser?.uid && // Only jobs where this user was accepted
          (job.status === "accepted" ||
            job.status === "Accepted" ||
            job.status === "filled" ||
            job.status === "Filled" ||
            job.status === "completed" ||
            job.status === "Completed") &&
          job.acceptedStartTime && // Make sure we have a start time
          new Date(job.acceptedStartTime) > now // Use accepted start time
        );
      })
      .sort(
        (a, b) => new Date(a.acceptedStartTime) - new Date(b.acceptedStartTime)
      )
      .slice(0, 5);

    console.log("Filtered upcoming shifts:", upcoming); // Debug log
    setUpcomingShifts(upcoming);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col m-10 gap-6 pb-10">
      <Breadcrumb />

      {/* Dashboard Heading */}
      <div className="border-b border-gray-200 pb-5 animate-[fadeIn_0.6s_ease-in-out]">
        <h3 className="text-base font-semibold text-gray-900">Dashboard</h3>
      </div>

      {/* Quick Stats Overview */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalHours}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Jobs Completed
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.jobsCompleted}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CurrencyPoundIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Earnings
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                £{stats.totalEarnings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Upcoming Shifts
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {upcomingShifts.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 ease-out delay-200 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Calendar Widget */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">
            Upcoming Shifts
          </h3>

          {upcomingShifts.length > 0 ? (
            <div className="space-y-3">
              {upcomingShifts.map((shift, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BriefcaseIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {shift.businessName || "Business"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(shift.acceptedStartTime)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(shift.acceptedStartTime)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {shift.acceptedStartTime && shift.acceptedEndTime
                        ? (
                            (new Date(shift.acceptedEndTime) -
                              new Date(shift.acceptedStartTime)) /
                            (1000 * 60 * 60)
                          ).toFixed(1)
                        : "TBD"}
                      h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming shifts</p>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">
            Performance Metrics
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  On-time Rate
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.onTimeRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.onTimeRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Completion Rate
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.completionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div
        className={`bg-white rounded-lg shadow p-6 transition-all duration-700 ease-out delay-400 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">
          Earnings Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              £{stats.totalEarnings}
            </p>
            <p className="text-sm text-gray-600">Total Earnings</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalHours > 0 && stats.totalEarnings > 0
                ? `£${(stats.totalEarnings / stats.totalHours).toFixed(2)}`
                : "£0"}
            </p>
            <p className="text-sm text-gray-600">Per Hour Average</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {stats.jobsCompleted > 0 && stats.totalEarnings > 0
                ? `£${(stats.totalEarnings / stats.jobsCompleted).toFixed(2)}`
                : "£0"}
            </p>
            <p className="text-sm text-gray-600">Per Job Average</p>
          </div>
        </div>

        {recentJobs.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Recent Jobs
            </h4>
            <div className="space-y-2">
              {recentJobs.map((job, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {job.businessName || "Business"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(job.appliedAt || job.endOfShift)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      £
                      {job.payRate
                        ? (
                            job.payRate *
                            ((new Date(job.endOfShift) -
                              new Date(job.startOfShift)) /
                              (1000 * 60 * 60))
                          ).toFixed(2)
                        : 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      {job.startOfShift && job.endOfShift
                        ? (
                            (new Date(job.endOfShift) -
                              new Date(job.startOfShift)) /
                            (1000 * 60 * 60)
                          ).toFixed(1)
                        : 0}
                      h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Activity Summary */}
      <div
        className={`bg-white rounded-lg shadow p-6 transition-all duration-700 ease-out delay-600 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">
          Job Application Activity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {stats.appliedJobsCount || 0}
            </p>
            <p className="text-sm text-gray-600">Total Applied Jobs</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {stats.pendingApplications || 0}
            </p>
            <p className="text-sm text-gray-600">Pending Applications</p>
          </div>
        </div>
      </div>

      {/* Business Stats Section - Always show at bottom */}
      <div
        className={`bg-white rounded-lg shadow p-6 transition-all duration-700 ease-out delay-800 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center sm:text-left">
          Business Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {stats.businessJobListings}
            </p>
            <p className="text-sm text-gray-600">Active Job Listings</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalBusinessJobs || 0}
            </p>
            <p className="text-sm text-gray-600">Total Jobs Posted</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalBusinessApplications || 0}
            </p>
            <p className="text-sm text-gray-600">Total Applications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHome;
