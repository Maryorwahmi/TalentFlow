import { useState } from 'react';

export const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Password changed successfully');
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-[600px] px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          <p className="text-gray-600 mt-2">Enter your current password, then choose a new one</p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1 text-sm"
            />
            <p className="mt-2 text-xs text-gray-600">Min. 8 characters.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1 text-sm"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#08107b] text-white font-medium rounded-lg hover:bg-[#060b59] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Change Password'}
            </button>
            <button
              type="button"
              className="px-6 py-2 border-2 border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
