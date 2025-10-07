import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { JobApplicationService } from '@/lib/services/job-application.service';
import AnalyticsCharts from '@/components/dashboard/analytics-charts';

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch all applications for analytics
  const result = await JobApplicationService.findAll(session.user.id, {}, 1, 1000);
  const applications = result.data;

  // Calculate analytics data
  const totalApplications = applications.length;
  const now = new Date();
  
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Monthly data for trend analysis
  const monthlyData = applications.reduce((acc, app) => {
    const month = new Date(app.applicationDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Weekly activity (last 8 weeks)
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const count = applications.filter(app => {
      const appDate = new Date(app.applicationDate);
      return appDate >= weekStart && appDate < weekEnd;
    }).length;
    
    return {
      week: `Week ${8 - i}`,
      count,
      date: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  }).reverse();

  // Calculate average response time (days between application and first interview)
  const interviewedApps = applications.filter(app => 
    ['INTERVIEW', 'OFFERED'].includes(app.status)
  );
  
  const avgResponseTime = interviewedApps.length > 0
    ? Math.round(
        interviewedApps.reduce((sum, app) => {
          const daysDiff = Math.floor(
            (new Date(app.updatedAt).getTime() - new Date(app.applicationDate).getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          return sum + daysDiff;
        }, 0) / interviewedApps.length
      )
    : 0;

  // Interview conversion rate
  const interviewRate = totalApplications > 0 
    ? Math.round(((statusCounts.INTERVIEW || 0) / totalApplications) * 100)
    : 0;

  // Offer rate
  const offerRate = totalApplications > 0 
    ? Math.round(((statusCounts.OFFERED || 0) / totalApplications) * 100)
    : 0;

  // Rejection rate
  const rejectionRate = totalApplications > 0 
    ? Math.round(((statusCounts.REJECTED || 0) / totalApplications) * 100)
    : 0;

  // Applications with follow-ups pending
  const pendingFollowUps = applications.filter(app => {
    if (!app.followUpDate) return false;
    return new Date(app.followUpDate) <= now && !['REJECTED', 'WITHDRAWN', 'OFFERED'].includes(app.status);
  }).length;

  // Applications this week
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  const applicationsThisWeek = applications.filter(app => 
    new Date(app.applicationDate) >= weekStart
  ).length;

  // Applications this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const applicationsThisMonth = applications.filter(app => 
    new Date(app.applicationDate) >= monthStart
  ).length;

  // Average applications per week
  const weeksActive = Math.max(
    1,
    Math.ceil(
      (now.getTime() - new Date(applications[0]?.applicationDate || now).getTime()) / 
      (1000 * 60 * 60 * 24 * 7)
    )
  );
  const avgPerWeek = totalApplications > 0 ? (totalApplications / weeksActive).toFixed(1) : '0';

  // Location insights
  const locationCounts = applications.reduce((acc, app) => {
    const location = app.location || 'Not specified';
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));

  // Salary insights
  const applicationsWithSalary = applications.filter(app => app.salary && app.salary > 0);
  const avgSalary = applicationsWithSalary.length > 0
    ? Math.round(
        applicationsWithSalary.reduce((sum, app) => sum + (app.salary || 0), 0) / 
        applicationsWithSalary.length
      )
    : 0;

  const minSalary = applicationsWithSalary.length > 0
    ? Math.min(...applicationsWithSalary.map(app => app.salary || 0))
    : 0;

  const maxSalary = applicationsWithSalary.length > 0
    ? Math.max(...applicationsWithSalary.map(app => app.salary || 0))
    : 0;

  // Get top companies
  const companyCounts = applications.reduce((acc, app) => {
    acc[app.companyName] = (acc[app.companyName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCompanies = Object.entries(companyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([company, count]) => ({ company, count }));

  // Recent activity (last 7 days)
  const recentApplications = applications
    .filter(app => {
      const appDate = new Date(app.applicationDate);
      const daysAgo = Math.floor((now.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= 7;
    })
    .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
    .slice(0, 5);

  const analyticsData = {
    totalApplications,
    statusCounts,
    monthlyData,
    weeklyData,
    avgResponseTime,
    interviewRate,
    offerRate,
    rejectionRate,
    pendingFollowUps,
    applicationsThisWeek,
    applicationsThisMonth,
    avgPerWeek,
    topCompanies,
    topLocations,
    avgSalary,
    minSalary,
    maxSalary,
    applicationsWithSalary: applicationsWithSalary.length,
    recentApplications,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            Track your job search progress and insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalApplications}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{successRate}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Interview + Offer stages
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{avgResponseTime}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Days to response
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Applications</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {(statusCounts.APPLIED || 0) + (statusCounts.INTERVIEW || 0)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Applied + Interview
            </p>
          </div>
        </div>

        {/* Charts */}
        <AnalyticsCharts data={analyticsData} />

        {/* Top Companies */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Companies Applied</h2>
          {topCompanies.length > 0 ? (
            <div className="space-y-4">
              {topCompanies.map((item, index) => (
                <div key={item.company} className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{item.company}</p>
                      <p className="text-sm text-gray-500">{item.count} application{item.count > 1 ? 's' : ''}</p>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                        style={{ width: `${(item.count / totalApplications) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No applications yet</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}