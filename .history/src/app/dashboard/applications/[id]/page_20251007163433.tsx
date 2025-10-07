import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { JobApplicationService } from "@/lib/services/job-application.service";
import { formatDate, getStatusColor, formatCurrency } from "@/lib/utils";
import DeleteApplicationButton from "@/components/dashboard/delete-application-button";
import { DocumentViewer } from "@/components/documents/document-viewer";

interface ApplicationPageProps {
  params: {
    id: string;
  };
}

export default async function ApplicationPage({
  params,
}: ApplicationPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const application = await JobApplicationService.findById(
    params.id,
    session.user.id
  );

  if (!application) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-gray-700">
            Dashboard
          </Link>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span>{application.companyName}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {application.position}
              </h1>
              <p className="text-xl text-gray-600">{application.companyName}</p>
            </div>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                application.status
              )}`}
            >
              {application.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Applied Date</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(application.applicationDate)}
              </p>
            </div>
            {application.location && (
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">
                  {application.location}
                </p>
              </div>
            )}
            {application.salary && (
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(application.salary)}
                </p>
              </div>
            )}
            {application.followUpDate && (
              <div>
                <p className="text-sm text-gray-500">Follow Up</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(application.followUpDate)}
                </p>
              </div>
            )}
          </div>

          {application.jobUrl && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                View Job Posting
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* Description */}
        {application.description && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Job Description
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {application.description}
            </p>
          </div>
        )}

        {/* Requirements */}
        {application.requirements && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Requirements
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {application.requirements}
            </p>
          </div>
        )}

        {/* Notes */}
        {application.notes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {application.notes}
            </p>
          </div>
        )}

        {/* Documents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Documents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Resume</p>
                  {application.resume ? (
                    <p className="text-xs text-gray-500 mt-1">
                      {application.resume.originalName}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      No resume uploaded
                    </p>
                  )}
                </div>
                {application.resume && (
                  <Link
                    href={`/api/documents/${application.resume.id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Cover Letter
                  </p>
                  {application.coverLetter ? (
                    <p className="text-xs text-gray-500 mt-1">
                      {application.coverLetter.originalName}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      No cover letter uploaded
                    </p>
                  )}
                </div>
                {application.coverLetter && (
                  <Link
                    href={`/api/documents/${application.coverLetter.id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <Link
                href={`/dashboard/applications/${application.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Application
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </Link>
            </div>
            <DeleteApplicationButton
              applicationId={application.id}
              companyName={application.companyName}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
