import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      title: 'Post Lost Item Details',
      description: 'Report what you lost with clear details and photos'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Upload Found Item Info',
      description: 'Share found item details with images to help owners recover them'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
        </svg>
      ),
      title: 'Search and Filter',
      description: 'Find lost items fast with smart filters and search'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: 'Contact the Owner',
      description: 'Reach the right person safely through the app'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Items Recovered' },
    { value: '5K+', label: 'Happy Users' },
    { value: '95%', label: 'Match Rate' },
    { value: '24/7', label: 'Active Support' }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-primary-200/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, 50, 0]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-primary-300/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full mb-6"
              >
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                <span className="text-primary-700 text-sm font-medium">AI-Powered Solution</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
              >
                Lost &amp; Found
                <span className="block gradient-text">Campus App</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 mb-8"
              >
                Report lost or found items, upload photos, search and filter results, and
                connect with owners in one secure campus workspace.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn-primary text-lg px-8 py-4">
                      Get Started
                    </Link>
                    <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                      Sign In
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Right Content - Animated Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Floating Cards */}
              <div className="relative h-[500px]">
                {/* Main Card */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-80 h-80 bg-white rounded-3xl shadow-2xl p-6 relative z-10">
                    <div className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl h-48 mb-4 overflow-hidden relative">
                      <img 
                        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400" 
                        alt="Lost Item"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Lost
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary-500 mb-1">85%</div>
                      <div className="text-gray-500 text-sm">Match Found!</div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, 30, 0] }}
                  transition={{ duration: 8, repeat: Infinity, delay: 1 }}
                  className="absolute top-10 -left-10 w-24 h-24 bg-white rounded-2xl shadow-xl p-3"
                >
                  <div className="bg-primary-100 rounded-xl h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 7, repeat: Infinity, delay: 2 }}
                  className="absolute bottom-20 -right-8 w-28 h-28 bg-white rounded-2xl shadow-xl p-3"
                >
                  <div className="bg-green-100 rounded-xl h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </motion.div>

                {/* Notification Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute top-1/2 -right-4 bg-white rounded-2xl shadow-2xl p-4 max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Match Found!</p>
                      <p className="text-xs text-gray-500">Your item might be found</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-primary-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered system makes finding lost items simple and efficient
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="card-hover p-8"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-500 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-3xl p-12 text-center relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-24 translate-y-24" />
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Find Your Item?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of students who have successfully recovered their lost items using our AI-powered system.
              </p>
              
              {!isAuthenticated && (
                <Link 
                  to="/login" 
                  className="inline-block bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Get Started Now
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">
                Smart<span className="text-primary-500">Campus</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 Smart Campus Lost & Found. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
