import { useState, useEffect } from 'react';
import { POLICY_TYPES } from '../../lib/constants';
import api from '../../api/axios';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import PolicyForm from './PolicyForm';
import toast from 'react-hot-toast';

export default function PoliciesList({ contactId, onEdit }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setPolicies([]);
      setError(null);
      
      const url = contactId ? `/policies?contactId=${contactId}` : '/policies';
      const response = await api.get(url);
      
      if (response.data) {
        setPolicies(response.data);
      } else {
        setPolicies([]);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message;
      setError(errorMessage);
      toast.error(`Failed to load policies: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [contactId]);

  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    setShowForm(true);
  };

  const handleDelete = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      await api.delete(`/policies/${policyId}`);
      toast.success('Policy deleted successfully');
      fetchPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message;
      toast.error(`Failed to delete policy: ${errorMessage}`);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPolicy(null);
    fetchPolicies();
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedPolicy) {
        await api.put(`/policies/${selectedPolicy.id}`, formData);
        toast.success('Policy updated successfully');
      } else {
        await api.post('/policies', formData);
        toast.success('Policy created successfully');
      }
      setShowForm(false);
      setSelectedPolicy(null);
      fetchPolicies();
    } catch (error) {
      console.error('Error saving policy:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message;
      toast.error(`Failed to save policy: ${errorMessage}`);
    }
  };

  if (loading) {
    return <div>Loading policies...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Policies</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage insurance policies for your clients.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Policy
          </button>
        </div>
      </div>

      {/* Filter by Type */}
      <div className="mt-4 sm:flex sm:items-center sm:justify-between">
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <select
            id="type"
            name="type"
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            value=""
            onChange={(e) => {}}
          >
            <option value="">All Types</option>
            {Object.entries(POLICY_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Policies Table */}
      <div className="mt-8 flex flex-col">
        {error ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">Unable to load policies</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={fetchPolicies}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retry
              </button>
            </div>
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No policies found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new policy.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Policy
              </button>
            </div>
          </div>
        ) : (
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Client
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Policy Type
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Policy Number
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Carrier
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Premium
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Expiry
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {policies.map((policy) => (
                      <tr key={policy.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {policy.contact?.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {policy.type}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {policy.policyNumber}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {policy.carrierName}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          ${policy.monthlyPremium}/mo
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {policy.expiryDate}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleEdit(policy)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <PencilIcon className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(policy.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <PolicyForm
        open={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        policy={selectedPolicy}
        contactId={contactId}
      />
    </div>
  );
}
