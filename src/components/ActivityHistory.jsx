import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const ActivityHistory = ({ activities, onRestoreTask }) => {
  const [expandedActivity, setExpandedActivity] = useState(null);

  // Add debug logging
  useEffect(() => {
    console.log('Activities in ActivityHistory:', activities);
  }, [activities]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'TASK_CREATED':
        return '➕';
      case 'TASK_COMPLETED':
        return '✅';
      case 'TASK_DELETED':
        return '🗑️';
      case 'TASK_EDITED':
        return '✏️';
      default:
        return '📝';
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'TASK_CREATED':
        return `Task "${activity.taskTitle}" was created`;
      case 'TASK_COMPLETED':
        return `Task "${activity.taskTitle}" was marked as complete`;
      case 'TASK_DELETED':
        return `Task "${activity.taskTitle}" was deleted`;
      case 'TASK_EDITED':
        return `Task "${activity.taskTitle}" was edited`;
      default:
        return activity.description || 'Unknown activity';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRestore = (activity) => {
    try {
      console.log('Attempting to restore task from activity:', activity);
      // Create minimal task data if none exists
      const taskData = activity.taskData || {
        title: activity.taskTitle,
        description: '',
        dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        priority: 'MEDIUM',
        status: 'PENDING'
      };
      console.log('Using taskData for restore:', taskData);
      onRestoreTask(taskData);
    } catch (error) {
      console.error('Error in handleRestore:', error);
      alert('Failed to restore task. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Activity History</h2>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center">No activities yet</p>
        ) : (
          activities.map((activity) => {
            console.log('Rendering activity:', activity);
            return (
              <div
                key={activity.id}
                className="flex flex-col p-3 hover:bg-gray-50 rounded-md border border-gray-100"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-xl">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900">
                        {getActivityDescription(activity)}
                      </p>
                      {activity.type === 'TASK_DELETED' && (
                        <button
                          onClick={() => handleRestore(activity)}
                          className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50 border border-blue-200 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Restore
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                    </p>
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                      onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                    >
                      {expandedActivity === activity.id ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Hide Details
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          View Details
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {expandedActivity === activity.id && (
                  <div className="mt-3 ml-8 p-3 bg-gray-50 rounded-md">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Title:</span>
                        <p className="text-sm text-gray-600">{activity.taskTitle}</p>
                      </div>
                      {activity.taskData?.description && (
                        <div>
                          <span className="text-sm font-medium text-gray-900">Description:</span>
                          <p className="text-sm text-gray-600">{activity.taskData.description}</p>
                        </div>
                      )}
                      {activity.taskData && (
                        <>
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="text-sm font-medium text-gray-900">Priority:</span>
                              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getPriorityBadgeClass(activity.taskData.priority)}`}>
                                {activity.taskData.priority}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">Status:</span>
                              <span className="ml-2 text-sm text-gray-600">{activity.taskData.status}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">Due Date:</span>
                            <p className="text-sm text-gray-600">
                              {format(new Date(activity.taskData.dueDate), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityHistory;
