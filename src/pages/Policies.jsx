import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import PoliciesList from '../components/policies/PoliciesList';
import PolicyForm from '../components/policies/PolicyForm';

export default function Policies() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const handleAddPolicy = () => {
    setSelectedPolicy(null);
    setIsFormOpen(true);
  };

  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPolicy(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Policies</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all insurance policies in your account including their policy number, type, and status.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleAddPolicy}
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            Add policy
          </button>
        </div>
      </div>

      <PoliciesList onEdit={handleEditPolicy} />

      <PolicyForm
        policy={selectedPolicy}
        open={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
}
