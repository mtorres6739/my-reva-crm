import React from 'react';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';

const Documents = () => {
  const handleUploadSuccess = (newDocument) => {
    // Refresh the document list after successful upload
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Documents</h1>
        <p className="text-gray-600">
          Upload and manage your documents here. You can also attach documents to specific tasks.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
        <DocumentUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">All Documents</h2>
        <DocumentList />
      </div>
    </div>
  );
};

export default Documents;
