import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import JobApplicationsList from "@/components/dashboard/job-applications-list";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}
          </h1>
          <p className="mt-2 text-gray-600">
            Track and manage your job applications
          </p>
        </div>

        <JobApplicationsList />
      </div>
    </DashboardLayout>
  );
}
