import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTeam, useMedals, useSports, useTeams, usePlayers } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import BackButton from '../components/BackButton';
import { formatDate, formatTime, findSportName, getTeamInitials } from '../utils/helpers';
import { Event } from '../types';

const TeamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const teamId = id ? parseInt(id) : 0;

  const { data: team, isLoading, error } = useTeam(teamId);
  const { data: sports } = useSports();
  const { data: teams } = useTeams();
  const { data: medals } = useMedals();
  const { data: players } = usePlayers();

  // Get team-specific schedules
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery<Event[]>({
    queryKey: ['schedules', 'team', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3001/api/v1/schedules/team/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!id,
  });

  // Get team's medals
  const teamMedals = medals?.filter(medal => medal.TeamID === teamId) || [];

  // Get team's players
  const teamPlayers = players?.filter(player => player.TeamID === teamId) || [];

  if (isLoading) {
    return <LoadingSpinner className="min-h-[400px]" />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Error loading team details"
        message={(error as Error).message}
      />
    );
  }

  if (!team) {
    return (
      <EmptyState
        title="Team not found"
        description="The requested team could not be found."
      />
    );
  }

  // Separate upcoming and completed events
  const upcomingEvents = schedules?.filter(event => 
    !event.Status || event.Status === 'Scheduled' || event.Status === 'In Progress'
  ) || [];
  
  const completedEvents = schedules?.filter(event => 
    event.Status === 'Completed'
  ) || [];

  return (
    <div className="max-w-6xl mx-auto px-4">
      <BackButton to="/teams" label="Back to Teams" />
      
      {/* Team Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-6">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-4"
            style={{ borderColor: team.Color }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-3xl"
              style={{ backgroundColor: team.Color }}
            >
              {team.Logo_URL ? (
                <img
                  src={team.Logo_URL}
                  alt={`${team.Name} logo`}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    // Show initials when logo fails to load
                    const initialsSpan = e.currentTarget.nextElementSibling as HTMLElement;
                    if (initialsSpan) {
                      initialsSpan.style.display = 'block';
                    }
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = 'block';
                    // Hide initials when logo loads successfully
                    const initialsSpan = e.currentTarget.nextElementSibling as HTMLElement;
                    if (initialsSpan) {
                      initialsSpan.style.display = 'none';
                    }
                  }}
                />
              ) : null}
              {!team.Logo_URL && (
                <span>
                  {getTeamInitials(team.Name)}
                </span>
              )}
              {team.Logo_URL && (
                <span style={{ display: 'none' }}>
                  {getTeamInitials(team.Name)}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-primary mb-2">{team.Name}</h1>
            <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">{team.Organization}</p>
            <p className="text-gray-700 italic">"{team.TagLine}"</p>
          </div>
          <div className="text-right">
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-300 mb-2"
              style={{ backgroundColor: team.Color }}
              title={`Team color: ${team.Color}`}
            />
            <p className="text-sm text-gray-500">Team #{team.ID}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Schedule Section */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Upcoming Schedule</h2>
          {isLoadingSchedules ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map(event => {
                const opponent = teams?.find(t => 
                  t.ID === (event.TeamA_ID === teamId ? event.TeamB_ID : event.TeamA_ID)
                );
                
                return (
                  <div key={event.ID} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-semibold text-lg text-gray-800">{event.Name}</h3>
                    <p className="text-primary font-medium">
                      {findSportName(event.SportID, sports || [])}
                    </p>
                    {opponent && (
                      <p className="text-gray-700">vs {opponent.Name}</p>
                    )}
                    <p className="text-gray-600">{formatDate(event.Date)}</p>
                    <p className="text-gray-600">{formatTime(event.Time)}</p>
                    <p className="text-gray-600">{event.Location}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.Status === 'In Progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {event.Status || 'Scheduled'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">No upcoming events scheduled.</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Recent Results</h2>
          {completedEvents && completedEvents.length > 0 ? (
            <div className="space-y-4">
              {completedEvents.slice(0, 5).map(event => {
                const opponent = teams?.find(t => 
                  t.ID === (event.TeamA_ID === teamId ? event.TeamB_ID : event.TeamA_ID)
                );
                const isWinner = event.WinnerTeamID === teamId;
                
                return (
                  <div key={event.ID} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-semibold text-lg text-gray-800">{event.Name}</h3>
                    <p className="text-primary font-medium">
                      {findSportName(event.SportID, sports || [])}
                    </p>
                    {opponent && (
                      <p className="text-gray-700">vs {opponent.Name}</p>
                    )}
                    <p className="text-gray-600">{formatDate(event.Date)}</p>
                    {event.WinnerTeamID && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isWinner
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isWinner ? 'Won' : 'Lost'}
                      </span>
                    )}
                    {(event.TeamA_Score || event.TeamB_Score) && (
                      <p className="text-sm text-gray-600 mt-1">
                        Score: {event.TeamA_Score} - {event.TeamB_Score}
                      </p>
                    )}
                    {event.ResultNotes && (
                      <p className="text-sm text-gray-600 italic">{event.ResultNotes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">No completed events yet.</p>
            </div>
          )}
        </div>

        {/* Team Players Section */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Team Players</h2>
          {teamPlayers && teamPlayers.length > 0 ? (
            <div className="space-y-4">
              {/* Group players by sport */}
              {sports?.map(sport => {
                const sportPlayers = teamPlayers.filter(player => player.SportID === sport.ID);
                if (sportPlayers.length === 0) return null;
                
                return (
                  <div key={sport.ID} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-semibold text-lg text-primary mb-2">{sport.Name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sportPlayers.map(player => (
                        <div key={player.ID} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-800 font-medium">
                            {player.FirstName} {player.LastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">No players assigned to this team yet.</p>
            </div>
          )}
        </div>

        {/* Medals Section */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Medal Summary</h2>
          {teamMedals && teamMedals.length > 0 ? (
            <div className="space-y-4">
              {teamMedals.map(medal => (
                <div key={medal.ID} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-semibold text-lg text-primary mb-2">
                    {findSportName(medal.SportID, sports || [])}
                  </h3>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <span className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {medal.Gold}
                        </span>
                        <span className="text-xs text-gray-600">Gold</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {medal.Silver}
                        </span>
                        <span className="text-xs text-gray-600">Silver</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {medal.Bronze}
                        </span>
                        <span className="text-xs text-gray-600">Bronze</span>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-gray-900">Total: {medal.Total}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">No medals won yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetail; 