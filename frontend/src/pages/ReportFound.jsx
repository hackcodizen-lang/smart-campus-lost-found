import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { itemsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import ImageUpload from '../components/ImageUpload';

const ReportFound = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    dateFound: new Date().toISOString().split('T')[0],
    contactInfo: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!image) {
      newErrors.image = 'Please upload an image of the found item';
    }
    if (!formData.title) {
      newErrors.title = 'Item name is required';
    }
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    if (!formData.dateFound) {
      newErrors.dateFound = 'Date is required';
    }
    if (!formData.contactInfo) {
      newErrors.contactInfo = 'Mobile number is required';
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
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('image', image.file);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('dateFound', formData.dateFound);
      formDataToSend.append('contactInfo', formData.contactInfo);

      const response = await itemsApi.createFoundItem(formDataToSend);

      if (response.data.success) {
        toast.success('Found item reported! We\'ll check for matches.');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to report found item');
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Report Found Item
            </h1>
            <p className="text-gray-600">
              Help reunite this item with its owner by uploading a photo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card p-8 space-y-6">
            {/* Image Upload */}
            <ImageUpload
              value={image}
              onChange={setImage}
              label="Upload Photo of Found Item"
              error={errors.image}
              isScanning={isScanning}
            />

            {/* Item Name */}
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

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Describe the item - brand, color, distinguishing features, contents, etc."
              />
            </div>

            {/* Location & Date */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Where was it found? *
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
                <label htmlFor="dateFound" className="block text-sm font-medium text-gray-700 mb-2">
                  Date Found *
                </label>
                <input
                  type="date"
                  id="dateFound"
                  name="dateFound"
                  value={formData.dateFound}
                  onChange={handleChange}
                  className={`input ${errors.dateFound ? 'input-error' : ''}`}
                />
                {errors.dateFound && (
                  <p className="mt-1 text-sm text-red-500">{errors.dateFound}</p>
                )}
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                className={`input ${errors.contactInfo ? 'input-error' : ''}`}
                placeholder="Enter your mobile number"
              />
              {errors.contactInfo && (
                <p className="mt-1 text-sm text-red-500">{errors.contactInfo}</p>
              )}
            </div>

            {/* Submit Button */}
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
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  {isScanning ? 'AI Scanning...' : 'Submitting...'}
                </span>
              ) : (
                'Report Found Item'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportFound;
