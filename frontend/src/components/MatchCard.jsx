import { motion } from 'framer-motion';
import { useState } from 'react';
import { getAssetUrl } from '../services/api';

const MatchCard = ({ match, onClaim, onConfirm, onReject }) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const lostItem = match.lostItemId;
  const foundItem = match.foundItemId;
  const similarity = match.similarityScore;

  const getImageUrl = (image) => {
    if (!image) return '/placeholder.jpg';
    return getAssetUrl(image);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMatchColor = () => {
    if (similarity >= 0.8) return 'from-green-400 to-green-600';
    if (similarity >= 0.6) return 'from-yellow-400 to-yellow-600';
    return 'from-gray-400 to-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Similarity Header */}
      <div className={`bg-gradient-to-r ${getMatchColor()} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">AI Match Found</span>
          </div>
          <div className="bg-white/20 px-4 py-1 rounded-full">
            <span className="text-white font-bold">
              {Math.round(similarity * 100)}% Similarity
            </span>
          </div>
        </div>
      </div>

      {/* Images Comparison */}
      <div className="grid grid-cols-2 gap-0">
        {/* Lost Item */}
        <div className="relative">
          <img
            src={getImageUrl(lostItem?.image)}
            alt="Lost item"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-2">
            <span className="text-white text-xs font-medium">Lost Item</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
            <p className="text-white text-xs truncate">{lostItem?.title}</p>
            <p className="text-white/70 text-xs">{formatDate(lostItem?.dateLost)}</p>
          </div>
        </div>

        {/* Found Item */}
        <div className="relative">
          <img
            src={getImageUrl(foundItem?.image)}
            alt="Found item"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-2">
            <span className="text-white text-xs font-medium">Found Item</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
            <p className="text-white text-xs truncate">{foundItem?.category}</p>
            <p className="text-white/70 text-xs">{formatDate(foundItem?.dateFound)}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span>Lost at: {lostItem?.location}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span>Found at: {foundItem?.location}</span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${match.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
            ${match.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
            ${match.status === 'claimed' ? 'bg-blue-100 text-blue-700' : ''}
            ${match.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
          `}>
            {match.status}
          </span>
        </div>

        {/* Actions */}
        {match.status === 'pending' && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onClaim?.(match._id)}
              className="flex-1 btn-primary text-sm py-2"
            >
              Claim Item
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onConfirm?.(match._id)}
              className="flex-1 btn-secondary text-sm py-2"
            >
              Confirm
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onReject?.(match._id)}
              className="btn-ghost text-red-600 text-sm py-2 px-4"
            >
              Reject
            </motion.button>
          </div>
        )}

        {match.status === 'confirmed' && (
          <div className="pt-3 border-t border-gray-100">
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm text-center">
              ✓ Match confirmed! Contact the other party to arrange return.
            </div>
          </div>
        )}

        {match.status === 'claimed' && (
          <div className="pt-3 border-t border-gray-100">
            <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm text-center">
              ✓ Item claimed! The finder has been notified.
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MatchCard;
