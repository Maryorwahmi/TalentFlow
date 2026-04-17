import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/shared/state/auth';
import { accountAPI } from '@/shared/api/client';

export const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const userWithPhone = user as (typeof user & { phone?: string }) | null;
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(userWithPhone?.phone || '');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Role-specific data
  const initialProfileData = (() => {
    try {
      if (user?.profileData) return typeof user.profileData === 'string' ? JSON.parse(user.profileData) : user.profileData;
    } catch (e) {
      return {};
    }
    return {};
  })();

  const [studentId, setStudentId] = useState(initialProfileData.studentId || '');
  const [employeeId, setEmployeeId] = useState(initialProfileData.employeeId || '');
  const [department, setDepartment] = useState(initialProfileData.department || '');
  const [organization, setOrganization] = useState(initialProfileData.organization || '');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const initials = `${firstName?.[0] || 'U'}${lastName?.[0] || ''}`.toUpperCase();

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large. Max 2MB');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowed.includes(file.type)) {
      alert('Unsupported file type. Use JPG, PNG or GIF');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemove = async () => {
    // Remove locally and request backend to clear picture
    setSelectedFile(null);
    setPreviewUrl(null);
    try {
      const response = await accountAPI.updateProfile({ profilePicture: null });
      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      console.error('Failed to remove profile picture', err);
      alert('Failed to remove profile picture');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Build profileData based on role-specific inputs (only include when non-empty)
    const profileData: any = {};
    if (studentId) profileData.studentId = studentId;
    if (employeeId) profileData.employeeId = employeeId;
    if (department) profileData.department = department;
    if (organization) profileData.organization = organization;
    const hasProfileData = Object.keys(profileData).length > 0;

    try {
      let response;
      // If a file is selected, send multipart/form-data
      if (selectedFile) {
        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        if (phone) formData.append('phone', phone);
        if (hasProfileData) {
          formData.append('profileData', JSON.stringify(profileData));
        }
        formData.append('profilePicture', selectedFile);

        response = await accountAPI.updateProfile(formData);
      } else {
        const payload: any = { firstName, lastName };
        if (phone) payload.phone = phone;
        if (hasProfileData) payload.profileData = profileData;
        response = await accountAPI.updateProfile(payload);
      }

      const updatedUser = response.data.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSelectedFile(null);
      setPreviewUrl(null);
      alert('Settings updated successfully');
    } catch (error: any) {
      console.error('Save failed', error);
      alert(error?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const profileImageSrc = previewUrl || user?.profilePicture || null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                {profileImageSrc ? (
                  <img
                    src={profileImageSrc}
                    alt="avatar"
                    className="h-20 sm:h-24 w-20 sm:w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="inline-flex h-20 sm:h-24 w-20 sm:w-24 items-center justify-center rounded-full bg-[#08107b] text-3xl sm:text-4xl font-semibold text-white">
                    {initials}
                  </div>
                )}
              </div>

              <div className="flex-1 w-full sm:w-auto">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Profile Picture</h3>
                <p className="text-xs text-gray-600 mb-3">JPG, GIF or PNG . Max size of 2MB</p>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="mb-4 text-base sm:text-lg font-semibold text-gray-900">Personal Information</h2>

            <div className="space-y-4">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                <input type="email" value={email} readOnly className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50" />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1"
                  placeholder="Phone number"
                />
              </div>

              {/* Role-specific fields */}
              {user?.role === 'learner' && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1"
                    placeholder="Student ID"
                  />
                </div>
              )}

              {user?.role === 'admin' && (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Employee ID</label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1"
                      placeholder="Employee ID"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1"
                      placeholder="Department"
                    />
                  </div>
                </div>
              )}

              {user && user.role !== 'learner' && user.role !== 'admin' && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Organization</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08107b] focus:ring-offset-1"
                    placeholder="Organization"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button type="submit" disabled={saving} className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-[#08107b] text-white font-medium rounded-lg hover:bg-[#060b59] disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="px-4 sm:px-6 py-2 text-sm sm:text-base border-2 border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
