import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { matchesApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import MatchCard from '../components/MatchCard';

const Matches = () => {
  const toast = useToast();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await matchesApi.getMatches({});
      setMatches(response.data.matches || []);
    } catch (error) {
      toast.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (matchId) => {
    try {
      const response = await matchesApi.claimMatch(matchId);
      if (response.data.success) {
        toast.success('Item claimed! The finder has been notified.');
        fetchMatches();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to claim item');
    }
  };

  const handleConfirm = async (matchId) => {
    try {
      const response = await matchesApi.confirmMatch(matchId);
      if (response.data.success) {
        toast.success('Match confirmed!');
        fetchMatches();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to confirm match');
    }
  };

  const handleReject = async (matchId) => {
    try {
      const response = await matchesApi.rejectMatch(matchId, 'Not the correct item');
      if (response.data.success) {
        toast.info('Match rejected');
        fetchMatches();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reject match');
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.status === filter;
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Match Results
            </h1>
            <p className="text-gray-600">
              View potential matches between lost and found items
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'pending', 'confirmed', 'claimed', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Matches List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full"
              />
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="space-y-6">
              {filteredMatches.map((match, index) => (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MatchCard
                    match={match}
                    onClaim={handleClaim}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No matches found yet' : `No ${filter} matches`}
              </h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'When you report lost or found items, AI will automatically find potential matches'
                  : `You don't have any ${filter} matches at the moment`
                }
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Matches;
