import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { itemsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import ImageUpload from '../components/ImageUpload';

const CATEGORIES = [
  'All',
  'ID Card',
  'Wallet',
  'Keys',
  'Phone',
  'Laptop',
  'Bag',
  'Clothing',
  'Books',
  'Other'
];

const RequestFind = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: '',
    category: 'All',
    status: 'all',
    location: ''
  });

  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    dateFound: new Date().toISOString().split('T')[0],
    contactInfo: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchFoundItems();
  }, []);

  const fetchFoundItems = async () => {
    try {
      setLoading(true);
      const response = await itemsApi.getFoundItems({ limit: 200 });
      setItems(response.data.items || []);
    } catch (error) {
      toast.error('Failed to load found items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesQuery = filters.query
        ? `${item.title || ''} ${item.description || ''} ${item.location || ''}`
            .toLowerCase()
            .includes(filters.query.toLowerCase())
        : true;

      const matchesCategory =
        filters.category === 'All' ? true : item.category === filters.category;

      const matchesStatus =
        filters.status === 'all' ? true : item.status === filters.status;

      const matchesLocation = filters.location
        ? item.location?.toLowerCase().includes(filters.location.toLowerCase())
        : true;

      return matchesQuery && matchesCategory && matchesStatus && matchesLocation;
    });
  }, [items, filters]);

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'All',
      status: 'all',
      location: ''
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!image) newErrors.image = 'Please upload an image of the found item';
    if (!formData.title) newErrors.title = 'Item name is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.dateFound) newErrors.dateFound = 'Date is required';
    if (!formData.contactInfo) newErrors.contactInfo = 'Mobile number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReportFound = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setIsScanning(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', image.file);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('dateFound', formData.dateFound);
      formDataToSend.append('contactInfo', formData.contactInfo);

      const response = await itemsApi.createFoundItem(formDataToSend);
      if (response.data.success) {
        toast.success('Found item reported successfully.');
        setImage(null);
        setFormData({
          title: '',
          description: '',
          location: '',
          dateFound: new Date().toISOString().split('T')[0],
          contactInfo: ''
        });
        fetchFoundItems();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to report found item');
    } finally {
      setSubmitting(false);
      setIsScanning(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Found Items</h1>
          <p className="text-gray-600 mt-2">
            Search found items and contact the finder if it is yours.
          </p>
        </motion.div>

        <div className="card p-6 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="input"
                placeholder="Search by name, description, location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="input"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="input"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="matched">Matched</option>
                <option value="claimed">Claimed</option>
                <option value="returned">Returned</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="input"
                placeholder="e.g., Library"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing {filteredItems.length} found items
            </p>
            <button onClick={clearFilters} className="btn-ghost text-sm">
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full"
            />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card overflow-hidden"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.image?.startsWith('http') ? item.image : `${item.image}`}
                    alt={item.title || 'Found item'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white text-xs">
                    Found on {formatDate(item.dateFound)}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {item.title || 'Found Item'}
                    </h3>
                    <span className="badge badge-info">{item.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> {item.location}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {item.contactInfo || 'Not provided'}
                  </div>
                  {item.contactInfo ? (
                    <a
                      href={`tel:${item.contactInfo}`}
                      className="mt-2 w-full btn-secondary text-sm text-center"
                    >
                      Call Finder
                    </a>
                  ) : (
                    <button
                      disabled
                      className="mt-2 w-full btn-ghost text-sm text-gray-400 cursor-not-allowed"
                    >
                      Call Finder
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card mb-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No found items yet</h3>
            <p className="text-gray-500">
              Try adjusting your filters or report a found item below.
            </p>
          </div>
        )}

        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-left mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Report Found Item</h2>
              <p className="text-gray-600 mt-1">
                Upload a photo and details so the owner can reach you.
              </p>
            </div>

            <form onSubmit={handleReportFound} className="card p-8 space-y-6">
              <ImageUpload
                value={image}
                onChange={setImage}
                label="Upload Photo of Found Item"
                error={errors.image}
                isScanning={isScanning}
              />

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="e.g., Black Wallet, Blue Backpack"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={4}
                  className="input"
                  placeholder="Describe the item - brand, color, identifying marks"
                />
              </div>

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
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    className={`input ${errors.dateFound ? 'input-error' : ''}`}
                  />
                  {errors.dateFound && (
                    <p className="mt-1 text-sm text-red-500">{errors.dateFound}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleFormChange}
                  className={`input ${errors.contactInfo ? 'input-error' : ''}`}
                  placeholder="Enter your mobile number"
                />
                {errors.contactInfo && (
                  <p className="mt-1 text-sm text-red-500">{errors.contactInfo}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={submitting || isScanning}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary py-4"
              >
                {submitting || isScanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
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
    </div>
  );
};

export default RequestFind;
