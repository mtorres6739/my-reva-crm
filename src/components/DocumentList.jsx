import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { FiFile, FiDownload, FiTrash2, FiUser, FiUsers, FiClipboard, FiFileText } from 'react-icons/fi';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const DocumentList = ({ taskId = null, onDocumentDelete }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    try {
      const url = taskId 
        ? `/api/documents/task/${taskId}`
        : '/api/documents';
      
      const response = await axios.get(url);
      setDocuments(response.data);
    } catch (err) {
      setError('Error fetching documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [taskId]);

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await axios.delete(`/api/documents/${documentId}`);
      setDocuments(documents.filter(doc => doc.id !== documentId));
      if (onDocumentDelete) {
        onDocumentDelete(documentId);
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Error deleting document');
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await axios.get(`/api/documents/${document.id}`);
      const { downloadUrl } = response.data;
      
      // Create a temporary link and click it to start the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = document.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Error downloading document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    // Add more file type icons as needed
    return <FiFile className="w-6 h-6" />;
  };

  if (loading) {
    return <div className="text-center py-4">Loading documents...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-4">{error}</div>;
  }

  if (documents.length === 0) {
    return <div className="text-gray-500 py-4">No documents found</div>;
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="text-gray-500">
              {getFileIcon(document.type)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{document.title}</h3>
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <FiUser className="w-4 h-4" />
                  <span>Uploaded by {document.uploadedBy?.name}</span>
                </div>
                {document.contact && (
                  <div className="flex items-center space-x-2">
                    <FiUsers className="w-4 h-4" />
                    <span>Contact: {document.contact.name}</span>
                  </div>
                )}
                {document.policy && (
                  <div className="flex items-center space-x-2">
                    <FiFileText className="w-4 h-4" />
                    <span>Policy: {document.policy.policyNumber}</span>
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  Uploaded {format(new Date(document.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDownload(document)}
              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
              title="Download"
            >
              <FiDownload className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDelete(document.id)}
              className="p-2 text-red-600 hover:text-red-800 transition-colors"
              title="Delete"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
