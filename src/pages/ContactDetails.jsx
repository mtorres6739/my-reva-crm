import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ContactDetails() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchContact = async () => {
      try {
        console.log('Fetching contact details for ID:', id);
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/contacts/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        console.log('Contact data:', data);
        setContact(data);
      } catch (error) {
        console.error('Error fetching contact:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    
    setSavingNote(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/contacts/${id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: contact.notes 
            ? `${contact.notes}\n\n${new Date().toLocaleString()}: ${newNote}`
            : `${new Date().toLocaleString()}: ${newNote}`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      setContact(prevContact => ({
        ...prevContact,
        notes: data.notes
      }));
      setNewNote('');
      setIsEditingNotes(false);
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note. Please try again.');
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
          <p className="text-red-700">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-4 mt-4">
          <p>Contact not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/contacts"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Contacts
          </Link>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => {/* TODO: Implement edit functionality */}}
          >
            Edit Contact
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Contact Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{contact.name}</h1>
                <p className="text-gray-600 mt-1">{contact.email}</p>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold
                ${contact.status === 'CLIENT' ? 'bg-green-100 text-green-800' : 
                  contact.status === 'LEAD' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'}`}>
                {contact.status}
              </span>
            </div>
          </div>

          {/* Contact Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 font-medium">Phone:</span>
                    <p className="text-gray-900">{contact.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Address:</span>
                    <p className="text-gray-900">{contact.address || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Workplace:</span>
                    <p className="text-gray-900">{contact.workplace || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Birth Date:</span>
                    <p className="text-gray-900">{formatDate(contact.birthdate)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignment</h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 font-medium">Assigned To:</span>
                    <p className="text-gray-900">{contact.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Last Updated:</span>
                    <p className="text-gray-900">{formatDate(contact.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Policies</h2>
              {contact.policies && contact.policies.length > 0 ? (
                <div className="space-y-4">
                  {contact.policies.map((policy, index) => (
                    <div key={policy.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{policy.type}</h3>
                          <p className="text-sm text-gray-600">Policy #{policy.policyNumber}</p>
                        </div>
                        <span className="text-green-600 font-medium">
                          {formatCurrency(policy.premium)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Status:</span> {policy.status}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Renewal Date:</span> {formatDate(policy.renewalDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 italic">No policies found</p>
              )}
              <button
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => {/* TODO: Implement add policy functionality */}}
              >
                + Add New Policy
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
            </div>

            {/* Existing Notes */}
            {contact.notes && (
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-line">{contact.notes}</p>
              </div>
            )}

            {/* Add Note Section */}
            <div className="mt-4">
              {isEditingNotes ? (
                <div className="space-y-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type your note here..."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setIsEditingNotes(false);
                        setNewNote('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote || !newNote.trim()}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        (savingNote || !newNote.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {savingNote ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Add Note
                </button>
              )}
            </div>
          </div>

          {/* Tags Section */}
          {contact.tags && Object.keys(contact.tags).length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(contact.tags).map(([category, value]) => (
                  <div key={category} className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 mr-2">{category}:</span>
                    {Array.isArray(value) ? (
                      value.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mr-2"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactDetails;
