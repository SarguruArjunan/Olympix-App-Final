import React, { useState } from 'react';
import EventAdmin from '../components/EventAdmin';
import TeamAdmin from '../components/TeamAdmin';
import MedalsAdmin from '../components/MedalsAdmin';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'teams' | 'medals'>('events');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Administration</h1>
        <p className="text-xl text-gray-600">Manage events and teams for the Olympics</p>
      </div>

              {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('events')}
                className={`w-1/3 py-4 px-6 text-center border-b-2 font-medium text-lg ${
                  activeTab === 'events'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Event Administration
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`w-1/3 py-4 px-6 text-center border-b-2 font-medium text-lg ${
                  activeTab === 'teams'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Team Administration
              </button>
              <button
                onClick={() => setActiveTab('medals')}
                className={`w-1/3 py-4 px-6 text-center border-b-2 font-medium text-lg ${
                  activeTab === 'medals'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Medals
              </button>
            </nav>
          </div>

                  {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'events' ? (
              <EventAdmin />
            ) : activeTab === 'teams' ? (
              <TeamAdmin />
            ) : (
              <MedalsAdmin />
            )}
          </div>
      </div>
    </div>
  );
};

export default Admin; 