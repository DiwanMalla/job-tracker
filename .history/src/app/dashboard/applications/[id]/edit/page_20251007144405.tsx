import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { JobApplicationService } from '@/lib/services/job-application.service';
import EditApplicationForm from '@/components/dashboard/edit-application-form';

interface EditApplicationPageProps {
  params: {
    id: string;
  };
}

export default async function EditApplicationPage({ params }: EditApplicationPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const application = await JobApplicationService.findById(params.id, session.user.id);

  if (!application) {
    redirect('/dashboard');
  }

  return (
    <DashboardLayout>
      <EditApplicationForm application={application} />
    </DashboardLayout>
  );
}