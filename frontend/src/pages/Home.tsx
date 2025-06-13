import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-primary to-blue-700 text-white rounded-lg">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo192.png"
            alt="PS Olympics Logo"
            className="w-48 h-48 mb-4"
          />
          <h1 className="text-4xl md:text-6xl font-bold">
            PS Olympix 2025
          </h1>
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-8 whitespace-nowrap overflow-hidden">
          Experience the thrill of competition in nine exciting sports events
        </h2>
        <Link to="/sports" className="btn-secondary bg-white text-primary hover:bg-opacity-90">
          Explore Sports
        </Link>
      </section>

      {/* Featured Sections */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Live Events */}
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-4">Live Events</h2>
          <p className="text-gray-600 mb-4">
            Stay updated with real-time scores and match progress
          </p>
          <Link to="/schedule" className="text-primary font-semibold hover:underline">
            View Schedule →
          </Link>
        </div>

        {/* Teams */}
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-4">Teams</h2>
          <p className="text-gray-600 mb-4">
            Meet the competing teams and explore their profiles
          </p>
          <Link to="/teams" className="text-primary font-semibold hover:underline">
            View Teams →
          </Link>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-4">Leaderboard</h2>
          <p className="text-gray-600 mb-4">
            See who's leading across all sports and medal standings
          </p>
          <Link to="/leaderboard" className="text-primary font-semibold hover:underline">
            View Leaders →
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;