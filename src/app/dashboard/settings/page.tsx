import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { ShareService } from '@/lib/services/share.service';
import ShareSettingsForm from '@/components/dashboard/share-settings-form';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const shareSettings = await ShareService.findByUserId(session.user.id);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your sharing preferences and privacy controls
          </p>
        </div>

        <ShareSettingsForm initialSettings={shareSettings} />
      </div>
    </DashboardLayout>
  );
}