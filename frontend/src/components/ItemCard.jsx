import { motion } from 'framer-motion';

const ItemCard = ({ 
  item, 
  type = 'lost', // 'lost' or 'found'
  onDelete,
  canDelete = true,
  showActions = false,
  similarity = null
}) => {
  const statusColors = {
    active: 'badge-info',
    pending: 'badge-warning',
    matched: 'badge-success',
    found: 'badge-success',
    claimed: 'badge-success',
    returned: 'badge-success',
    confirmed: 'badge-success',
    rejected: 'badge-error',
    expired: 'badge-error'
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card-hover overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image?.startsWith('http') ? item.image : `${item.image}`}
          alt={item.title || 'Item image'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${type === 'lost' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
            {type === 'lost' ? 'Lost' : 'Found'}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`badge ${statusColors[item.status] || 'badge-info'}`}>
            {item.status}
          </span>
        </div>

        {/* Similarity Score */}
        {similarity !== null && (
          <div className="absolute bottom-3 right-3">
            <div className={`
              px-3 py-1 rounded-full text-sm font-bold
              ${similarity >= 0.8 
                ? 'bg-green-500 text-white' 
                : similarity >= 0.6 
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-500 text-white'
              }
            `}>
              {Math.round(similarity * 100)}% Match
            </div>
          </div>
        )}

        {/* Date */}
        <div className="absolute bottom-3 left-3 text-white text-sm">
          <p>{type === 'lost' ? 'Lost' : 'Found'} on {formatDate(item.dateLost || item.dateFound)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {item.title || item.category}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{item.location}</span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => onDelete?.(item._id)}
              disabled={!canDelete}
              className={`flex-1 btn-ghost text-sm py-2 ${
                canDelete ? 'text-red-600' : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              {canDelete ? 'Delete' : 'Locked'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ItemCard;
