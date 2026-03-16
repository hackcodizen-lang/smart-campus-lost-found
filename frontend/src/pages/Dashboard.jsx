import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { itemsApi, matchesApi, notificationsApi } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [foundItems, setFoundItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({ q: '', status: 'all' });
  const [loadingFound, setLoadingFound] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [selectedFound, setSelectedFound] = useState(null);

  useEffect(() => {
    fetchFoundItems();
  }, [filters.q, filters.status]);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchFoundItems = async () => {
    try {
      setLoadingFound(true);
      const params = {};
      if (filters.q.trim()) params.q = filters.q.trim();
      if (filters.status !== 'all') params.status = filters.status;
      const response = await itemsApi.getFoundItems(params);
      setFoundItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching found items:', error);
    } finally {
      setLoadingFound(false);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoadingMatches(true);
      const response = await matchesApi.getMatches({});
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await notificationsApi.getNotifications(6);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ q: '', status: 'all' });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getImageUrl = (image) => {
    if (!image) return '';
    return image.startsWith('http') ? image : image;
  };

  const isOwner = (item) => {
    if (!item || !user) return false;
    const ownerId = item.userId?._id || item.userId;
    const currentUserId = user.id || user._id;
    return ownerId && currentUserId && ownerId.toString() === currentUserId.toString();
  };

  const handleDeleteFound = async (itemId) => {
    try {
      await itemsApi.deleteFoundItem(itemId);
      setFoundItems(prev => prev.filter(item => item._id !== itemId));
      setSelectedFound(null);
      toast.success('Found item deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete found item');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage campus lost and found in one place
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Latest Notifications</h2>
            <button onClick={fetchNotifications} className="text-sm text-primary-600 hover:text-primary-700">
              Refresh
            </button>
          </div>
          {loadingNotifications ? (
            <div className="flex items-center justify-center py-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full"
              />
            </div>
          ) : notifications.length > 0 ? (
            <ul className="space-y-3">
              {notifications.map((note) => (
                <li key={note._id} className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full ${note.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div>
                    <p className="text-sm text-gray-800">{note.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No notifications yet.</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          <Link
            to="/report-lost"
            className="group card p-6 hover:border-red-200 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Lost</h3>
                <p className="text-sm text-gray-500">Report your missing item to find a match</p>
              </div>
            </div>
          </Link>

          <Link
            to="/request-find"
            className="group card p-6 hover:border-green-200 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Found</h3>
                <p className="text-sm text-gray-500">Search found items and report what you found</p>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="q" className="block text-sm font-medium text-gray-700 mb-2">
                  Search found posts
                </label>
                <input
                  id="q"
                  name="q"
                  type="text"
                  value={filters.q}
                  onChange={handleFilterChange}
                  className="input"
                  placeholder="Search by item name, description, or location"
                />
              </div>
              <div className="w-full md:w-56">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="matched">Matched</option>
                  <option value="claimed">Claimed</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={clearFilters} className="btn-ghost h-11">
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Found Posts</h2>
              <span className="text-sm text-gray-500">{foundItems.length} posts</span>
            </div>

            {loadingFound ? (
              <div className="flex items-center justify-center py-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full"
                />
              </div>
            ) : foundItems.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundItems.map((item, index) => (
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
                      <button
                        onClick={() => setSelectedFound(item)}
                        className="mt-2 w-full btn-secondary text-sm"
                      >
                        Click to view details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 card">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No found posts yet</h3>
                <p className="text-gray-500">Be the first to report a found item</p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Matches</h2>
              <Link to="/matches" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            {loadingMatches ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full"
                />
              </div>
            ) : matches.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {matches.slice(0, 2).map((match, index) => (
                  <motion.div
                    key={match._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-0">
                      <div className="relative h-36">
                        <img
                          src={getImageUrl(match.lostItemId?.image)}
                          alt="Lost item"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                          Lost
                        </div>
                      </div>
                      <div className="relative h-36">
                        <img
                          src={getImageUrl(match.foundItemId?.image)}
                          alt="Found item"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-1 rounded">
                          Found
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">AI Similarity</p>
                        <span className="text-sm font-bold text-primary-600">
                          {Math.round(match.similarityScore * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Status: <span className="font-medium">{match.status}</span>
                      </p>
                      <Link to="/matches" className="btn-secondary text-sm w-full text-center">
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 card">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
                <p className="text-gray-500">Matches will appear as items are reported</p>
              </div>
            )}
          </div>
        </motion.div>

        {selectedFound && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Found Report Details</h3>
                <div className="flex items-center gap-3">
                  {isOwner(selectedFound) && (
                    <button
                      onClick={() => handleDeleteFound(selectedFound._id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedFound(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 p-6">
                <img
                  src={selectedFound.image?.startsWith('http') ? selectedFound.image : `${selectedFound.image}`}
                  alt={selectedFound.title || 'Found item'}
                  className="w-full h-56 object-cover rounded-xl"
                />
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Title</p>
                    <p className="text-base font-semibold text-gray-900">{selectedFound.title || 'Found Item'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm text-gray-700">{selectedFound.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm text-gray-700">{selectedFound.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date Found</p>
                    <p className="text-sm text-gray-700">{formatDate(selectedFound.dateFound)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact Phone</p>
                    <p className="text-sm text-gray-700">{selectedFound.contactInfo || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
