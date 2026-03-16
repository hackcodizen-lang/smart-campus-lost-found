import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useRef, useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen(prev => !prev)}
                className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold"
                aria-label="User menu"
              >
                U
              </motion.button>

              {menuOpen && (
                <div className="absolute left-0 mt-3 w-56 rounded-xl border border-gray-200 bg-white shadow-lg p-3 z-50">
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500">Account</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {isAuthenticated ? user?.name : 'Guest'}
                    </p>
                  </div>
                  {isAuthenticated && (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="btn-ghost text-sm"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </motion.button>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
            aria-label="Go back"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-gray-800 pointer-events-none">
          Campus Lost &amp; Found App
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
