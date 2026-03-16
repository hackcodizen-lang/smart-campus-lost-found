import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { itemsApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const ReportLost = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    dateLost: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.title) {
      newErrors.title = 'Item name is required';
    }
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    if (!formData.dateLost) {
      newErrors.dateLost = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setIsScanning(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('dateLost', formData.dateLost);

      const response = await itemsApi.createLostItem(formDataToSend);

      if (response.data.success) {
        toast.success('Lost item reported successfully. We will look for matches.');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to report lost item');
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Report Lost Item
            </h1>
            <p className="text-gray-600">
              Report an item that belongs to you and is missing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card p-8 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g., Black Wallet, Blue Backpack"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`input ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe your item - brand, color, identifying marks, etc."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Where was it lost? *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`input ${errors.location ? 'input-error' : ''}`}
                  placeholder="e.g., Library, Cafeteria"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              <div>
                <label htmlFor="dateLost" className="block text-sm font-medium text-gray-700 mb-2">
                  Date Lost *
                </label>
                <input
                  type="date"
                  id="dateLost"
                  name="dateLost"
                  value={formData.dateLost}
                  onChange={handleChange}
                  className={`input ${errors.dateLost ? 'input-error' : ''}`}
                />
                {errors.dateLost && (
                  <p className="mt-1 text-sm text-red-500">{errors.dateLost}</p>
                )}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || isScanning}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-4"
            >
              {loading || isScanning ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  {isScanning ? 'AI Scanning...' : 'Submitting...'}
                </span>
              ) : (
                'Report Lost Item'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportLost;
