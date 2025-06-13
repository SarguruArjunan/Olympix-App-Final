import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSport, useMedals, useTeams } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import IconImage from '../components/IconImage';
import { formatDate, formatTime } from '../utils/helpers';
import { getTeamInitials } from '../utils/helpers';
import { Event } from '../types';

const SportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const sportId = id ? parseInt(id) : 0;

  const { data: sport, isLoading, error } = useSport(sportId);
  const { data: medals, isLoading: isLoadingMedals } = useMedals();
  const { data: teams, isLoading: isLoadingTeams } = useTeams();

  // Note: This would need a custom API endpoint for sport-specific schedules
  // For now, using a direct query but this could be moved to the API service later
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery<Event[]>({
    queryKey: ['schedules', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3001/api/v1/schedules/sport/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!id,
  });

  // Filter medals for this sport and combine with team data
  const sportMedals = React.useMemo(() => {
    if (!medals || !teams) return [];
    
    return medals
      .filter(medal => medal.SportID === sportId && medal.Total > 0)
      .map(medal => {
        const team = teams.find(t => t.ID === medal.TeamID);
        return {
          ...medal,
          teamName: team?.Name || 'Unknown Team',
          teamColor: team?.Color || '#6B7280',
          teamLogo: team?.Logo_URL || '',
        };
      })
      .sort((a, b) => {
        // Sort by total medals descending, then by gold, silver, bronze
        if (b.Total !== a.Total) return b.Total - a.Total;
        if (b.Gold !== a.Gold) return b.Gold - a.Gold;
        if (b.Silver !== a.Silver) return b.Silver - a.Silver;
        return b.Bronze - a.Bronze;
      });
  }, [medals, teams, sportId]);

  // Filter completed events with results for this sport
  const completedResults = React.useMemo(() => {
    if (!schedules || !teams) return [];
    
    return schedules
      .filter(event => event.Status === 'Completed' && (event.WinnerTeamID || event.TeamA_Score || event.TeamB_Score))
      .map(event => {
        const teamA = teams.find(t => t.ID === event.TeamA_ID);
        const teamB = teams.find(t => t.ID === event.TeamB_ID);
        const winner = teams.find(t => t.ID === event.WinnerTeamID);
        return {
          ...event,
          teamAName: teamA?.Name || 'TBD',
          teamBName: teamB?.Name || 'TBD',
          winnerName: winner?.Name || 'Draw/No Winner',
          teamAColor: teamA?.Color || '#6B7280',
          teamBColor: teamB?.Color || '#6B7280',
          winnerColor: winner?.Color || '#6B7280',
        };
      })
      .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime()); // Most recent first
  }, [schedules, teams]);

  if (isLoading) {
    return <LoadingSpinner className="min-h-[400px]" />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Error loading sport details"
        message={(error as Error).message}
      />
    );
  }

  if (!sport) {
    return (
      <EmptyState
        title="Sport not found"
        description="The requested sport could not be found."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center gap-6 mb-8">
        <IconImage
          src={sport.Icon_URL}
          alt={`Icon for ${sport.Name}`}
          className="w-24 h-24 object-contain"
        />
        <h1 className="text-4xl font-bold text-primary">{sport.Name}</h1>
      </div>
      <p className="text-lg text-gray-700 mb-8">{sport.Description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="card p-8 min-h-[400px]">
          <h2 className="text-2xl font-bold text-primary mb-6">Schedule</h2>
          {isLoadingSchedules ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : schedules && schedules.filter(event => event.Status !== 'Completed').length > 0 ? (
            <div className="space-y-6">
              {schedules.filter(event => event.Status !== 'Completed').map(event => (
                <div key={event.ID} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{event.Name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.Status === 'In Progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {event.Status || 'Scheduled'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{formatDate(event.Date)}</p>
                  <p className="text-gray-600 mb-1">{formatTime(event.Time)}</p>
                  <p className="text-gray-600">{event.Location}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">No upcoming events scheduled.</p>
            </div>
          )}
        </div>

        <div className="card p-8 min-h-[400px]">
          <h2 className="text-2xl font-bold text-primary mb-6">Results</h2>
          {isLoadingSchedules || isLoadingTeams ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : completedResults && completedResults.length > 0 ? (
            <div className="space-y-6">
              {completedResults.map(result => (
                <div key={result.ID} className="border-b pb-6 last:border-b-0 last:pb-0">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{result.Name}</h3>
                  <p className="text-gray-600 mb-2">{formatDate(result.Date)}</p>
                  
                  {/* Teams and Score */}
                  {(result.teamAName !== 'TBD' || result.teamBName !== 'TBD') && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {result.teamAName} vs {result.teamBName}
                        </span>
                        {(result.TeamA_Score || result.TeamB_Score) && (
                          <span className="font-mono text-gray-800">
                            {result.TeamA_Score || '—'} - {result.TeamB_Score || '—'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Winner */}
                  {result.WinnerTeamID && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Winner:</span>
                      <span 
                        className="text-sm font-bold px-2 py-1 rounded text-white"
                        style={{ backgroundColor: result.winnerColor }}
                      >
                        🏆 {result.winnerName}
                      </span>
                    </div>
                  )}
                  
                  {/* Additional Notes */}
                  {result.ResultNotes && (
                    <p className="text-sm text-gray-600 mt-2 italic">{result.ResultNotes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">No completed events with results yet.</p>
            </div>
          )}
        </div>

        <div className="card p-8 min-h-[400px]">
          <h2 className="text-2xl font-bold text-primary mb-6">Medals</h2>
          {isLoadingMedals || isLoadingTeams ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : sportMedals && sportMedals.length > 0 ? (
            <div className="space-y-4">
              {sportMedals.map((medal) => (
                <div key={medal.ID} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {/* Team Logo/Initials */}
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {medal.teamLogo ? (
                        <img
                          src={medal.teamLogo}
                          alt={`${medal.teamName} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-base" style="background-color: ${medal.teamColor}">${getTeamInitials(medal.teamName)}</div>`;
                            }
                          }}
                        />
                      ) : (
                        <div 
                          className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-base"
                          style={{ backgroundColor: medal.teamColor }}
                        >
                          {getTeamInitials(medal.teamName)}
                        </div>
                      )}
                    </div>
                    
                    {/* Team Name */}
                    <div>
                      <p className="font-medium text-gray-900 text-base">{medal.teamName}</p>
                    </div>
                  </div>
                  
                  {/* Medal Counts */}
                                      <div className="flex items-center space-x-3">
                      {medal.Gold > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xl">🥇</span>
                          <span className="text-base font-bold text-yellow-600">{medal.Gold}</span>
                        </div>
                      )}
                      {medal.Silver > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xl">🥈</span>
                          <span className="text-base font-bold text-gray-600">{medal.Silver}</span>
                        </div>
                      )}
                      {medal.Bronze > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-xl">🥉</span>
                          <span className="text-base font-bold text-orange-600">{medal.Bronze}</span>
                        </div>
                      )}
                      <div className="ml-2 px-3 py-1 bg-primary text-white text-sm font-bold rounded">
                        {medal.Total}
                      </div>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">No medals awarded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SportDetail;