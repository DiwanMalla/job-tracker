import { notFound } from 'next/navigation';
import { ShareService } from '@/lib/services/share.service';
import { JobApplicationService } from '@/lib/services/job-application.service';
import { SharedApplicationsList } from '@/components/shared/shared-applications-list';

interface SharedPageProps {
  params: Promise<{ shareId: string }>;
}

export default async function SharedPage({ params }: SharedPageProps) {
  const { shareId } = await params;

  // Get share settings
  const shareSettings = await ShareService.findByShareId(shareId);

  if (!shareSettings || !shareSettings.isActive) {
    notFound();
  }

  // Check if link has expired
  if (shareSettings.expiresAt && new Date(shareSettings.expiresAt) < new Date()) {
    notFound();
  }

  // Get user's job applications
  const applications = await JobApplicationService.getAllByUserId(shareSettings.userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Shared Job Applications
          </h1>
          <p className="text-gray-600">
            View-only access to job application tracker
          </p>
          {shareSettings.expiresAt && (
            <p className="text-sm text-gray-500 mt-2">
              Expires on: {new Date(shareSettings.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Applications List */}
        <SharedApplicationsList
          applications={applications}
          showNotes={shareSettings.showNotes}
          showDocuments={shareSettings.showDocuments}
        />
      </div>
    </div>
  );
}