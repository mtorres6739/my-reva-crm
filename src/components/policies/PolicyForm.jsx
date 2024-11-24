import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { POLICY_TYPES } from '../../lib/constants';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const initialFormState = {
  type: '',
  policyNumber: '',
  coverageType: '',
  effectiveDate: '',
  expiryDate: '',
  monthlyPremium: '',
  annualPremium: '',
  carrierName: '',
  notes: '',
};

export default function PolicyForm({ policy, open, onClose, contactId }) {
  const [formData, setFormData] = useState(policy || { ...initialFormState, contactId });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const create = useMutation(api.policies.create);
  const update = useMutation(api.policies.update);

  // Reset form when policy changes
  useEffect(() => {
    setFormData(policy || { ...initialFormState, contactId });
  }, [policy, contactId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const numericFormData = {
        ...formData,
        monthlyPremium: parseFloat(formData.monthlyPremium),
        annualPremium: parseFloat(formData.annualPremium),
      };

      if (policy) {
        await update({
          id: policy._id,
          ...numericFormData,
        });
        toast.success('Policy updated successfully');
      } else {
        await create(numericFormData);
        toast.success('Policy created successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Error saving policy');
      console.error('Error saving policy:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog as="div" className="relative z-10" open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                  {policy ? 'Edit Policy' : 'Add Policy'}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Policy Type
                      </label>
                      <div className="mt-1">
                        <select
                          name="type"
                          id="type"
                          required
                          value={formData.type}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Select Type</option>
                          {Object.entries(POLICY_TYPES).map(([key, value]) => (
                            <option key={key} value={value}>
                              {key.charAt(0) + key.slice(1).toLowerCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700">
                        Policy Number
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="policyNumber"
                          id="policyNumber"
                          required
                          value={formData.policyNumber}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="coverageType" className="block text-sm font-medium text-gray-700">
                        Coverage Type
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="coverageType"
                          id="coverageType"
                          required
                          value={formData.coverageType}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="carrierName" className="block text-sm font-medium text-gray-700">
                        Carrier Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="carrierName"
                          id="carrierName"
                          required
                          value={formData.carrierName}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700">
                        Effective Date
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          name="effectiveDate"
                          id="effectiveDate"
                          required
                          value={formData.effectiveDate}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          name="expiryDate"
                          id="expiryDate"
                          required
                          value={formData.expiryDate}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="monthlyPremium" className="block text-sm font-medium text-gray-700">
                        Monthly Premium
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="monthlyPremium"
                          id="monthlyPremium"
                          required
                          min="0"
                          step="0.01"
                          value={formData.monthlyPremium}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="annualPremium" className="block text-sm font-medium text-gray-700">
                        Annual Premium
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="annualPremium"
                          id="annualPremium"
                          required
                          min="0"
                          step="0.01"
                          value={formData.annualPremium}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <div className="mt-1">
                        <textarea
                          name="notes"
                          id="notes"
                          rows={3}
                          value={formData.notes}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
