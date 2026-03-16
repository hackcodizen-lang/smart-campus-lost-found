import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminRoute;
