import React, { useState, useEffect } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import { useAuth } from '../contexts/AuthContext';
import axios from '../lib/axios';

const Documents = () => {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState('');
  const [contacts, setContacts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, policiesRes] = await Promise.all([
          axios.get('/api/contacts'),
          axios.get('/api/policies')
        ]);
        setContacts(contactsRes.data);
        setPolicies(policiesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error loading contacts and policies');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUploadSuccess = (newDocument) => {
    // Refresh the document list after successful upload
    window.location.reload();
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Documents</h1>
        <p className="text-gray-600">
          Upload and manage your documents here. You can also attach documents to specific contacts and policies.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Contact</label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedContact}
            onChange={(e) => setSelectedContact(e.target.value)}
          >
            <option value="">Select a contact...</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Policy (Optional)</label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedPolicy}
            onChange={(e) => setSelectedPolicy(e.target.value)}
            disabled={!selectedContact}
          >
            <option value="">Select a policy...</option>
            {policies
              .filter((policy) => policy.contactId === parseInt(selectedContact))
              .map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.policyNumber} - {policy.type}
                </option>
              ))}
          </select>
        </div>
        <DocumentUpload 
          contactId={selectedContact} 
          policyId={selectedPolicy || undefined} 
          onUploadSuccess={handleUploadSuccess} 
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">All Documents</h2>
        <DocumentList />
      </div>
    </div>
  );
};

export default Documents;
