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
      link.download = document.fileName;
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
              {getFileIcon(document.fileType)}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {document.fileName}
              </h4>
              <div className="flex space-x-4 text-xs text-gray-500">
                <span>{formatFileSize(document.fileSize)}</span>
                <span>•</span>
                <span>{format(new Date(document.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs">
                {document.user && (
                  <div className="flex items-center text-blue-600">
                    <FiUser className="w-3 h-3 mr-1" />
                    <span>{document.user.name}</span>
                  </div>
                )}
                {document.contact && (
                  <Link to={`/contacts/${document.contact.id}`} className="flex items-center text-green-600 hover:text-green-700">
                    <FiUsers className="w-3 h-3 mr-1" />
                    <span>{document.contact.name}</span>
                  </Link>
                )}
                {document.task && (
                  <Link to={`/tasks/${document.task.id}`} className="flex items-center text-purple-600 hover:text-purple-700">
                    <FiClipboard className="w-3 h-3 mr-1" />
                    <span>{document.task.title}</span>
                  </Link>
                )}
                {document.policy && (
                  <Link to={`/policies/${document.policy.id}`} className="flex items-center text-orange-600 hover:text-orange-700">
                    <FiFileText className="w-3 h-3 mr-1" />
                    <span>{document.policy.policyNumber}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDownload(document)}
              className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
              title="Download document"
            >
              <FiDownload className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDelete(document.id)}
              className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
              title="Delete document"
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
