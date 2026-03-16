import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import Matches from './pages/Matches';
import NotFound from './pages/NotFound';
import RequestFind from './pages/RequestFind';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Floating gradient background */}
            <div className="floating-gradient" />
            
            {/* Navigation */}
            <Navbar />
            
            {/* Main Content */}
            <main className="relative z-10">
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/report-lost" 
                    element={
                      <ProtectedRoute>
                        <ReportLost />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/report-found" 
                    element={
                      <ProtectedRoute>
                        <ReportFound />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/matches" 
                    element={
                      <ProtectedRoute>
                        <Matches />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/request-find" 
                    element={
                      <ProtectedRoute>
                        <RequestFind />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
