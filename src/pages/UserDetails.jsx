import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRightIcon, UserIcon } from '@heroicons/react/20/solid';

const UserHierarchyPath = ({ user }) => {
  const navigate = useNavigate();

  // Build the hierarchy path
  const buildPath = (user) => {
    const path = [];
    let currentUser = user;
    
    // Add the current user
    path.unshift({
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role
    });

    // Add the supervisor if exists
    if (currentUser.supervisor) {
      path.unshift({
        id: currentUser.supervisor.id,
        name: currentUser.supervisor.name,
        role: currentUser.supervisor.role
      });
    }

    return path;
  };

  const path = buildPath(user);

  return (
    <nav className="flex mb-8" aria-label="User hierarchy">
      <ol className="flex items-center space-x-4">
        {path.map((item, index) => (
          <li key={item.id} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
            )}
            <button
              onClick={() => navigate(`/users/${item.id}`)}
              className={`ml-4 text-sm font-medium ${
                index === path.length - 1
                  ? 'text-indigo-600 hover:text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center">
                <UserIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                {item.name} ({item.role})
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `Failed to fetch user details (${response.status})`);
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    } else {
      setError('Invalid user ID');
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No user found</h3>
            <p className="mt-1 text-sm text-gray-500">The user you're looking for doesn't exist.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Back to Users
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hierarchy Path */}
        <UserHierarchyPath user={user} />

        {/* User Details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal and team information.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.role}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Reports to</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.supervisor ? (
                    <button
                      onClick={() => navigate(`/users/${user.supervisor.id}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {user.supervisor.name} ({user.supervisor.role})
                    </button>
                  ) : (
                    'None'
                  )}
                </dd>
              </div>
              {user.subordinates?.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Team Members</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {user.subordinates.map((subordinate) => (
                        <li
                          key={subordinate.id}
                          className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                        >
                          <div className="w-0 flex-1 flex items-center">
                            <UserIcon className="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                            <span className="ml-2 flex-1 w-0 truncate">
                              {subordinate.name} ({subordinate.role})
                            </span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button
                              onClick={() => navigate(`/users/${subordinate.id}`)}
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              View
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
