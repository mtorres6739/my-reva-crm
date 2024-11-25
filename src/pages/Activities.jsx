import React from 'react';

export default function Activities() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Activities</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all activities and events in your account.
          </p>
        </div>
      </div>
      {/* Activities content will go here */}
      <div className="mt-8">
        <p className="text-gray-500">No activities to display.</p>
      </div>
    </div>
  );
}
