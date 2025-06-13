import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents, useSports, useTeams } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ScheduleFilter from '../components/ScheduleFilter';
import { formatDate, formatTime, findSportName, getTeamInitials } from '../utils/helpers';

const Schedule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: events, isLoading: isLoadingEvents } = useEvents();
  const { data: sports } = useSports();
  const { data: teams } = useTeams();

  if (isLoadingEvents) {
    return <LoadingSpinner className="min-h-[400px]" />;
  }

  // Filter events based on status
  const currentEvents = events?.filter(event => 
    !event.Status || event.Status === 'Scheduled' || event.Status === 'In Progress'
  ) || [];
  
  const completedEvents = events?.filter(event => 
    event.Status === 'Completed'
  ) || [];

  const displayedEvents = activeTab === 'current' ? currentEvents : completedEvents;

  // Apply sport and date filters
  const filteredEvents = displayedEvents.filter(event => {
    if (selectedSport && event.SportID !== selectedSport) {
      return false;
    }
    if (selectedDate && event.Date !== selectedDate) {
      return false;
    }
    return true;
  });

  // Component for displaying team with logo
  const TeamDisplay: React.FC<{ teamId: number; className?: string }> = ({ teamId, className = "" }) => {
    const team = teams?.find(t => t.ID === teamId);
    if (!team) return null;

    return (
      <Link to={`/teams/${teamId}`} className={`flex items-center space-x-2 hover:text-primary-dark ${className}`}>
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {team.Logo_URL ? (
            <img
              src={team.Logo_URL}
              alt={`${team.Name} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs" style="background-color: ${team.Color}">${getTeamInitials(team.Name)}</div>`;
                }
              }}
            />
          ) : (
            <div 
              className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: team.Color }}
            >
              {getTeamInitials(team.Name)}
            </div>
          )}
        </div>
        <span className="font-medium">{team.Name}</span>
      </Link>
    );
  };

  // Component for displaying sport icon only
  const SportIcon: React.FC<{ sportId: number; className?: string }> = ({ sportId, className = "" }) => {
    const sport = sports?.find(s => s.ID === sportId);
    if (!sport) return null;

    return (
      <Link to={`/sports/${sportId}`} className={`hover:opacity-80 transition-opacity ${className}`} title={sport.Name}>
        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {sport.Icon_URL ? (
            <img
              src={sport.Icon_URL}
              alt={`${sport.Name} icon`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-full rounded-lg flex items-center justify-center text-gray-600 font-bold text-xs">${sport.Name.charAt(0).toUpperCase()}</div>`;
                }
              }}
            />
          ) : (
            <div className="w-full h-full rounded-lg flex items-center justify-center text-gray-600 font-bold text-xs">
              {sport.Name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-primary mb-8">Event Schedule</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content - Left Side */}
        <div className="flex-1">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`w-1/2 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'current'
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Current Events ({currentEvents.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`w-1/2 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'completed'
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Completed Events ({completedEvents.length})
                </button>
              </nav>
            </div>
          </div>
          
          {filteredEvents && filteredEvents.length > 0 ? (
            <div className="space-y-6">
              {filteredEvents.map(event => {
                const teamA = teams?.find(t => t.ID === event.TeamA_ID);
                const teamB = teams?.find(t => t.ID === event.TeamB_ID);

                return (
                  <div key={event.ID} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <SportIcon sportId={event.SportID} className="text-primary" />
                            <h2 className="text-2xl font-bold text-gray-800">{event.Name}</h2>
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              event.Status === 'Completed' 
                                ? 'bg-green-100 text-green-800'
                                : event.Status === 'In Progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {event.Status || 'Scheduled'}
                            </span>
                          </div>
                          
                          {/* Enhanced Team Display with Logos */}
                          {teamA && teamB ? (
                            <div className="flex items-center justify-center mb-4 bg-gray-50 rounded-lg p-4">
                              <TeamDisplay teamId={teamA.ID} className="text-primary font-semibold" />
                              <div className="mx-4 text-gray-400 font-bold text-xl">VS</div>
                              <TeamDisplay teamId={teamB.ID} className="text-primary font-semibold" />
                            </div>
                          ) : teamA ? (
                            <div className="mb-4">
                              <TeamDisplay teamId={teamA.ID} className="text-primary font-semibold text-lg" />
                            </div>
                          ) : teamB ? (
                            <div className="mb-4">
                              <TeamDisplay teamId={teamB.ID} className="text-primary font-semibold text-lg" />
                            </div>
                          ) : null}
                          
                          <div className="flex flex-wrap items-center gap-4 text-gray-600">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              <Link 
                                to={`/sports/${event.SportID}`}
                                className="text-primary hover:text-primary-dark font-medium"
                              >
                                {findSportName(event.SportID, sports || [])}
                              </Link>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(event.Date)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{formatTime(event.Time)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{event.Location}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Show results for completed events */}
                      {activeTab === 'completed' && event.Status === 'Completed' && (event.WinnerTeamID || event.TeamA_Score || event.TeamB_Score || event.ResultNotes) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">Results</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {event.WinnerTeamID && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">Winner:</span>
                                <TeamDisplay teamId={event.WinnerTeamID} className="text-green-600 font-bold hover:text-green-700" />
                              </div>
                            )}
                            
                            {(event.TeamA_Score || event.TeamB_Score) && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">Final Score:</span>
                                <span className="font-bold text-gray-900">
                                  {event.TeamA_Score || '—'} - {event.TeamB_Score || '—'}
                                </span>
                              </div>
                            )}
                            
                            {event.ResultNotes && (
                              <div className="md:col-span-3">
                                <span className="text-sm font-medium text-gray-600">Notes:</span>
                                <p className="text-gray-800 mt-1">{event.ResultNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title={activeTab === 'current' ? 'No current events found' : 'No completed events found'}
              description={
                activeTab === 'current'
                  ? selectedSport || selectedDate
                    ? "Try adjusting your filters to see more events."
                    : "Current events will appear here when they are scheduled."
                  : selectedSport || selectedDate
                    ? "Try adjusting your filters to see completed events."
                    : "Completed events will appear here once events finish."
              }
              icon={
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          )}
        </div>

        {/* Filter Sidebar - Right Side */}
        <div className="lg:w-80">
          <ScheduleFilter
            sports={sports || []}
            selectedSport={selectedSport}
            selectedDate={selectedDate}
            onSportChange={setSelectedSport}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>
    </div>
  );
};

export default Schedule;