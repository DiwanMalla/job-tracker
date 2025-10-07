'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ShareSettings } from '@/types';

interface ShareSettingsFormProps {
  initialSettings: ShareSettings | null;
}

export default function ShareSettingsForm({ initialSettings }: ShareSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [settings, setSettings] = useState({
    isActive: initialSettings?.isActive ?? false,
    showNotes: initialSettings?.showNotes ?? false,
    showDocuments: initialSettings?.showDocuments ?? false,
    expiresAt: initialSettings?.expiresAt 
      ? new Date(initialSettings.expiresAt).toISOString().split('T')[0]
      : '',
  });

  const shareUrl = initialSettings?.shareId
    ? `${window.location.origin}/shared/${initialSettings.shareId}`
    : '';

  const handleToggleSharing = async (enabled: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (enabled) {
        // Enable sharing
        const response = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isActive: true,
            showNotes: settings.showNotes,
            showDocuments: settings.showDocuments,
            expiresAt: settings.expiresAt || null,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setSuccess('Sharing enabled successfully!');
          router.refresh();
        } else {
          setError(result.error || 'Failed to enable sharing');
        }
      } else {
        // Disable sharing
        const response = await fetch('/api/share', {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          setSuccess('Sharing disabled successfully!');
          router.refresh();
        } else {
          setError(result.error || 'Failed to disable sharing');
        }
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showNotes: settings.showNotes,
          showDocuments: settings.showDocuments,
          expiresAt: settings.expiresAt || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Settings updated successfully!');
        router.refresh();
      } else {
        setError(result.error || 'Failed to update settings');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy link');
    }
  };

  const handleRegenerateLink = async () => {
    if (!confirm('Are you sure you want to regenerate the share link? The old link will stop working.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/share/regenerate', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Share link regenerated successfully!');
        router.refresh();
      } else {
        setError(result.error || 'Failed to regenerate link');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable Sharing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Public Sharing</h2>
            <p className="text-sm text-gray-600 mt-1">
              Share your job applications list with others via a public link
            </p>
          </div>
          <button
            onClick={() => {
              const newState = !settings.isActive;
              setSettings({ ...settings, isActive: newState });
              handleToggleSharing(newState);
            }}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              settings.isActive ? 'bg-blue-600' : 'bg-gray-200'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        {settings.isActive && shareUrl && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={handleRegenerateLink}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Regenerate Link
            </button>
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      {settings.isActive && (
        <form onSubmit={handleUpdateSettings} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
          <p className="text-sm text-gray-600 mb-6">
            Control what information is visible in your shared list
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="showNotes" className="text-sm font-medium text-gray-700">
                  Show Notes
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Include personal notes in the shared view
                </p>
              </div>
              <input
                type="checkbox"
                id="showNotes"
                checked={settings.showNotes}
                onChange={(e) => setSettings({ ...settings, showNotes: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="showDocuments" className="text-sm font-medium text-gray-700">
                  Show Documents
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Allow access to resumes and cover letters
                </p>
              </div>
              <input
                type="checkbox"
                id="showDocuments"
                checked={settings.showDocuments}
                onChange={(e) => setSettings({ ...settings, showDocuments: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                Link Expiration (Optional)
              </label>
              <input
                type="date"
                id="expiresAt"
                value={settings.expiresAt}
                onChange={(e) => setSettings({ ...settings, expiresAt: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for no expiration
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}