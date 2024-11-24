import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleDrop = async (acceptedFiles) => {
    try {
      const file = acceptedFiles[0];
      if (!file) return;

      // Get pre-signed URL from backend
      const { data: presignedUrl } = await api.get(`/api/profile/upload-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`);

      // Upload directly to S3
      setUploadProgress(0);
      await axios.put(presignedUrl.url, file, {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
        withCredentials: false,
        maxRedirects: 0
      });

      // Update profile with new picture URL
      const { data: updatedUser } = await api.post('/api/profile/picture', {
        imageUrl: presignedUrl.imageUrl
      });

      console.log('Upload successful:', updatedUser);

      // Update user profile picture
      if (setUser) {
        setUser(prev => ({
          ...prev,
          profilePictureUrl: updatedUser.profilePicture
        }));
      }
      setSuccess('Profile picture updated successfully!');
      setError('');
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading profile picture:', error.response?.data || error);
      setError(error.response?.data?.message || 'Error uploading profile picture');
      setSuccess('');
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB limit
    multiple: false
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/profile');
      setFormData({
        ...formData,
        name: data.name,
        email: data.email
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/profile/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    try {
      const { data } = await api.put('/api/profile', {
        name: formData.name,
        email: formData.email,
        currentPassword: formData.currentPassword || undefined,
        newPassword: formData.newPassword || undefined
      });

      setUser(data);
      setSuccess('Profile updated successfully');
      setEditMode(false);
      
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setSuccess('');
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      await api.delete('/api/profile/picture');
      setSuccess('Profile picture deleted successfully');
      setError('');
      fetchProfile(); // Refresh profile data
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting profile picture');
      setSuccess('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-8 md:gap-8">
      <div className="md:col-span-8 lg:col-span-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Profile Information
            </h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-md ${
                editMode
                  ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Profile Picture Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {user?.profilePictureUrl ? (
                  <div className="relative">
                    <img
                      src={user.profilePictureUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                    {editMode && (
                      <button
                        onClick={handleDeleteProfilePicture}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Delete profile picture"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl text-gray-500">
                      {user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <div
                  {...getRootProps()}
                  className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Drop the image here...</p>
                  ) : (
                    <p>Click or drag to upload profile picture</p>
                  )}
                  {uploadProgress > 0 && (
                    <p>Uploading... {uploadProgress}%</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {editMode && (
              <>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">
                      Change Password
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>

      <div className="md:col-span-4 lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Role Information
          </h2>
          <p className="text-gray-700">
            Role: {user?.role}
          </p>
          {user?.supervisor && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                Supervisor
              </h3>
              <p className="text-gray-700">
                {user.supervisor.name}
              </p>
            </div>
          )}
          {user?.subordinates?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                Team Members
              </h3>
              <p className="text-gray-700">
                {user.subordinates.length}
              </p>
            </div>
          )}
        </div>

        {stats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Activity Overview
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Contacts
                </h3>
                <p className="text-gray-700">
                  {stats.contacts}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Tasks
                </h3>
                <p className="text-gray-700">
                  {stats.tasks}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Documents
                </h3>
                <p className="text-gray-700">
                  {stats.documents}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Events
                </h3>
                <p className="text-gray-700">
                  {stats.events}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
