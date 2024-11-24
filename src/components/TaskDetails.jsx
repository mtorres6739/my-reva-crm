import React, { useState } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';

const TaskDetails = ({ task, onClose }) => {
  const [documents, setDocuments] = useState([]);

  const handleUploadSuccess = (newDocument) => {
    setDocuments([newDocument, ...documents]);
  };

  const handleDocumentDelete = (documentId) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-600">{task.description || 'No description provided'}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Due Date</h3>
          <p className="text-gray-600">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date set'}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Status</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-sm ${
              task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {task.completed ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Documents</h3>
          <div className="mb-4">
            <DocumentUpload 
              taskId={task.id} 
              onUploadSuccess={handleUploadSuccess} 
            />
          </div>
          <DocumentList 
            taskId={task.id} 
            onDocumentDelete={handleDocumentDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
