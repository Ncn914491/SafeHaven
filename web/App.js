import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../src/config/firebase';
import { signInWithEmail, getUserProfile, signOut } from '../src/services/auth';
import { UserRole } from '../src/config/firebase';

// Import Tailwind CSS
import './styles.css';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import SOSMessages from './pages/SOSMessages';
import Reports from './pages/Reports';
import Shelters from './pages/Shelters';
import CreateAlert from './pages/CreateAlert';
import Maps from './pages/Maps';

// Initialize Firebase Auth
const auth = getAuth(app);

const App = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Get user profile to determine role
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmail(email, password);
      // Don't set currentPage here - let the auth state change handle it
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleSignup = () => {
    // Don't set currentPage here - let the auth state change handle it
  };

  const handleSwitchToSignup = () => {
    setAuthMode('signup');
  };

  const handleSwitchToLogin = () => {
    setAuthMode('login');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentPage('login');
      setAuthMode('login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if user has admin privileges
  const isAdmin = userProfile?.role === UserRole.ADMIN;

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'alerts':
        return <Alerts />;
      case 'sos-messages':
        return <SOSMessages />;
      case 'reports':
        return <Reports />;
      case 'shelters':
        return <Shelters />;
      case 'maps':
        return <Maps />;
      case 'create-alert':
        return <CreateAlert onNavigate={setCurrentPage} />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SafeHaven...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <div className="main-layout">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 sidebar-layout`}>
            <Sidebar
              currentPage={currentPage}
              onNavigate={(page) => {
                setCurrentPage(page);
                setSidebarOpen(false); // Close sidebar on mobile after navigation
              }}
              isAdmin={isAdmin}
              userProfile={userProfile}
            />
          </div>

          <div className="content-layout">
            <Header
              user={user}
              userProfile={userProfile}
              onLogout={handleLogout}
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            />
            <main className="page-content scrollable-container bg-gray-50">
              <div className="max-w-7xl mx-auto">
                <div className="page-wrapper">
                  {renderCurrentPage()}
                </div>
              </div>
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {authMode === 'login' ? (
            <Login
              onLogin={handleLogin}
              onSwitchToSignup={handleSwitchToSignup}
            />
          ) : (
            <Signup
              onSignup={handleSignup}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default App;
