import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 font-heading text-xl font-bold">
                <img src="/logo192.png" alt="PowerSchool Olympix Logo" className="w-8 h-8" />
                <span>PowerSchool Olympix</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark"
                >
                  Home
                </Link>
                <Link
                  to="/sports"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark"
                >
                  Sports
                </Link>
                <Link
                  to="/teams"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark"
                >
                  Teams
                </Link>
                <Link
                  to="/schedule"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark"
                >
                  Schedule
                </Link>
                <Link
                  to="/star-players"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark"
                >
                  Star Players
                </Link>
                <Link
                  to="/leaderboard"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark"
                >
                  Leaderboard
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/admin"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark bg-red-600 hover:bg-red-700"
                    >
                      Admin
                    </Link>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-300">
                        Welcome, {user?.username}
                      </span>
                      <button
                        onClick={handleLogout}
                        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark bg-gray-600 hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-dark bg-green-600 hover:bg-green-700"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">PS Olympix 2025</h3>
              <p className="text-sm text-gray-400">Celebrating Excellence</p>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} All rights reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;