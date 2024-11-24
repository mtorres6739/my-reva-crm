import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@prisma/client';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

const roleColors = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  BROKER: 'bg-green-100 text-green-800',
  AGENT: 'bg-yellow-100 text-yellow-800',
};

const UserDetails = ({ user }) => {
  return (
    <div className="px-4 py-4 sm:px-6 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
          <div className="mt-2">
            <p className="text-sm text-gray-900">Email: {user.email}</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500">Role Information</h4>
          <div className="mt-2">
            <p className="text-sm text-gray-900">Role: {user.role}</p>
            <p className="text-sm text-gray-900">Reports to: {user.supervisor?.name || 'None'}</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500">Team Information</h4>
          <div className="mt-2">
            <p className="text-sm text-gray-900">Team Size: {user.subordinates?.length || 0}</p>
            {user.subordinates?.length > 0 && (
              <div className="mt-1">
                <p className="text-sm text-gray-500">Team Members:</p>
                <ul className="mt-1 space-y-1">
                  {user.subordinates.map(subordinate => (
                    <li key={subordinate.id} className="text-sm text-gray-900">
                      {subordinate.name} ({subordinate.role})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersTable = ({ users, currentUserRole }) => {
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const getRoleColor = (role) => roleColors[role] || 'bg-gray-100 text-gray-800';

  const toggleRow = (userId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(userId)) {
      newExpandedRows.delete(userId);
    } else {
      newExpandedRows.add(userId);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Supervisor
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Team Size
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr className={expandedRows.has(user.id) ? 'bg-gray-50' : undefined}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {user.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.supervisor?.name || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.subordinates?.length || 0}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {currentUserRole !== 'AGENT' && (
                          <button
                            type="button"
                            onClick={() => toggleRow(user.id)}
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                          >
                            {expandedRows.has(user.id) ? (
                              <>
                                Hide Details
                                <ChevronUpIcon className="ml-1.5 h-4 w-4" />
                              </>
                            ) : (
                              <>
                                View Details
                                <ChevronDownIcon className="ml-1.5 h-4 w-4" />
                              </>
                            )}
                          </button>
                        )}
                        {currentUserRole !== 'AGENT' && (
                          <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-900 ml-4"
                            onClick={() => navigate(`/users/${user.id}`)}
                          >
                            View Profile
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedRows.has(user.id) && (
                      <tr>
                        <td colSpan="6" className="p-0">
                          <UserDetails user={user} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
