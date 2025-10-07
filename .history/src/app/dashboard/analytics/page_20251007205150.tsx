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

        {/* Key Metrics - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalApplications}</p>
                <p className="mt-1 text-xs text-green-600">↑ {applicationsThisWeek} this week</p>
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
                <p className="text-sm font-medium text-gray-600">Interview Rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{interviewRate}%</p>
                <p className="mt-1 text-xs text-gray-500">{statusCounts.INTERVIEW || 0} interviews</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offer Rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{offerRate}%</p>
                <p className="mt-1 text-xs text-gray-500">{statusCounts.OFFERED || 0} offers received</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Per Week</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{avgPerWeek}</p>
                <p className="mt-1 text-xs text-gray-500">applications/week</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Follow-ups</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{pendingFollowUps}</p>
                <p className="mt-1 text-xs text-orange-600">Action needed</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejection Rate</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{rejectionRate}%</p>
                <p className="mt-1 text-xs text-gray-500">{statusCounts.REJECTED || 0} rejections</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{applicationsThisMonth}</p>
                <p className="mt-1 text-xs text-gray-500">applications sent</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{avgResponseTime}</p>
                <p className="mt-1 text-xs text-gray-500">days to interview</p>
              </div>
              <div className="p-3 bg-teal-100 rounded-lg">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
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