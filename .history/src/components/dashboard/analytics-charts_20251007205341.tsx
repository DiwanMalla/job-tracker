'use client';

interface AnalyticsData {
  totalApplications: number;
  statusCounts: Record<string, number>;
  monthlyData: Record<string, number>;
  weeklyData: Array<{ week: string; count: number; date: string }>;
  avgResponseTime: number;
  interviewRate: number;
  offerRate: number;
  rejectionRate: number;
  pendingFollowUps: number;
  applicationsThisWeek: number;
  applicationsThisMonth: number;
  avgPerWeek: string;
  topCompanies: Array<{ company: string; count: number }>;
  topLocations: Array<{ location: string; count: number }>;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
  applicationsWithSalaryCount: number;
  recentApplications: Array<{
    id: string;
    position: string;
    companyName: string;
    status: string;
    applicationDate: Date;
  }>;
}

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const { statusCounts, weeklyData } = data;

  // Prepare status distribution data
  const statusData = [
    { name: 'Applied', value: statusCounts.APPLIED || 0, color: 'bg-blue-500' },
    { name: 'Interview', value: statusCounts.INTERVIEW || 0, color: 'bg-yellow-500' },
    { name: 'Offered', value: statusCounts.OFFERED || 0, color: 'bg-green-500' },
    { name: 'Rejected', value: statusCounts.REJECTED || 0, color: 'bg-red-500' },
    { name: 'Withdrawn', value: statusCounts.WITHDRAWN || 0, color: 'bg-gray-500' },
  ];

  const maxStatusValue = Math.max(...statusData.map(s => s.value), 1);

  // Get max weekly value for scaling
  const maxWeeklyValue = Math.max(...weeklyData.map(w => w.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Distribution Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Application Status Distribution</h2>
        <div className="space-y-4">
          {statusData.map((status) => (
            <div key={status.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${status.color} mr-2`}></div>
                  <span className="text-sm font-medium text-gray-700">{status.name}</span>
                </div>
                <span className="text-sm text-gray-600">{status.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${status.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${(status.value / maxStatusValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pie Chart Representation */}
        <div className="mt-6 flex justify-center">
          <div className="relative w-48 h-48">
            {data.totalApplications > 0 ? (
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {(() => {
                  const radius = 70;
                  const circumference = 2 * Math.PI * radius;
                  let cumulativePercent = 0;
                  
                  const colors = {
                    'Applied': '#3B82F6',
                    'Interview': '#EAB308',
                    'Offered': '#10B981',
                    'Rejected': '#EF4444',
                    'Withdrawn': '#6B7280',
                  };

                  return statusData.map((status) => {
                    if (status.value === 0) return null;
                    
                    const percentage = (status.value / data.totalApplications);
                    const strokeLength = circumference * percentage;
                    const strokeDasharray = `${strokeLength} ${circumference}`;
                    const strokeDashoffset = -cumulativePercent * circumference;
                    cumulativePercent += percentage;

                    return (
                      <circle
                        key={status.name}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="transparent"
                        stroke={colors[status.name as keyof typeof colors]}
                        strokeWidth="50"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                      />
                    );
                  });
                })()}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Timeline Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Applications Timeline</h2>
        {months.length > 0 ? (
          <div className="space-y-4">
            {/* Bar Chart */}
            <div className="flex items-end justify-between h-64 space-x-2">
              {months.slice(-6).map((month) => {
                const value = monthlyData[month];
                const height = (value / maxMonthlyValue) * 100;
                
                return (
                  <div key={month} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center justify-end h-56">
                      <span className="text-xs font-semibold text-gray-700 mb-1">{value}</span>
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-purple-700"
                        style={{ height: `${height}%`, minHeight: value > 0 ? '8px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 mt-2 text-center">{month}</span>
                  </div>
                );
              })}
            </div>

            {/* Line Chart Alternative */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Trend</h3>
              <div className="relative h-32">
                <svg className="w-full h-full" preserveAspectRatio="none">
                  <polyline
                    points={months.slice(-6).map((month, index) => {
                      const x = (index / (months.slice(-6).length - 1)) * 100;
                      const y = 100 - ((monthlyData[month] / maxMonthlyValue) * 80);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#9333EA" />
                    </linearGradient>
                  </defs>
                  
                  {/* Data points */}
                  {months.slice(-6).map((month, index) => {
                    const x = (index / (months.slice(-6).length - 1)) * 100;
                    const y = 100 - ((monthlyData[month] / maxMonthlyValue) * 80);
                    return (
                      <circle
                        key={month}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="4"
                        fill="#3B82F6"
                        className="transition-all duration-500"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="mt-2">No application history yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}