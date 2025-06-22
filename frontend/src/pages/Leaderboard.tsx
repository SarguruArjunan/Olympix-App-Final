import React, { useState, useMemo } from 'react';
import { TeamWithMedals } from '../types';
import { useTeams, useMedals } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { getTeamInitials } from '../utils/helpers';

interface TeamWithMedalsAndRank extends TeamWithMedals {
  staticRank: number; // Static rank based on Olympic-style medal sorting
}

type SortField = 'rank' | 'team' | 'country' | 'gold' | 'silver' | 'bronze' | 'total';
type SortDirection = 'asc' | 'desc';

const Leaderboard: React.FC = () => {
  const { data: teams, isLoading: teamsLoading, error: teamsError } = useTeams();
  const { data: medals, isLoading: medalsLoading, error: medalsError } = useMedals();
  
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'gold' || field === 'silver' || field === 'bronze' || field === 'total' ? 'desc' : 'asc');
    }
  };

  const handleClearSorting = () => {
    setSortField('rank');
    setSortDirection('asc');
  };

  const isDefaultSorting = sortField === 'rank' && sortDirection === 'asc';

  const sortTeams = (teams: TeamWithMedalsAndRank[]): TeamWithMedalsAndRank[] => {
    return [...teams].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'rank':
          aValue = a.staticRank;
          bValue = b.staticRank;
          break;
        case 'team':
          aValue = a.Name.toLowerCase();
          bValue = b.Name.toLowerCase();
          break;
        case 'country':
          aValue = a.Country.toLowerCase();
          bValue = b.Country.toLowerCase();
          break;
        case 'gold':
          aValue = a.medals.Gold;
          bValue = b.medals.Gold;
          break;
        case 'silver':
          aValue = a.medals.Silver;
          bValue = b.medals.Silver;
          break;
        case 'bronze':
          aValue = a.medals.Bronze;
          bValue = b.medals.Bronze;
          break;
        case 'total':
          aValue = a.medals.Total;
          bValue = b.medals.Total;
          break;
        default:
          aValue = a.staticRank;
          bValue = b.staticRank;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      
      // Secondary sort by team name for ties
      if (a.Name < b.Name) return -1;
      if (a.Name > b.Name) return 1;
      return 0;
    });
  };

  const sortedTeams = useMemo((): TeamWithMedalsAndRank[] => {
    if (!teams || !medals) {
      return [];
    }

    // Combine teams with their medal data
    const teamsWithMedals: TeamWithMedalsAndRank[] = teams.map(team => {
      const teamMedals = medals
        .filter(medal => medal.TeamID === team.ID)
        .reduce(
          (acc, medal) => ({
            Gold: acc.Gold + medal.Gold,
            Silver: acc.Silver + medal.Silver,
            Bronze: acc.Bronze + medal.Bronze,
            Total: acc.Total + medal.Total,
          }),
          { Gold: 0, Silver: 0, Bronze: 0, Total: 0 }
        );

      return {
        ...team,
        medals: teamMedals,
        staticRank: 0 // Will be assigned after Olympic-style sorting
      };
    });

    // First, sort by Olympic-style ranking to determine static ranks
    const olympicSorted = teamsWithMedals.sort((a, b) => {
      if (a.medals.Gold !== b.medals.Gold) return b.medals.Gold - a.medals.Gold;
      if (a.medals.Silver !== b.medals.Silver) return b.medals.Silver - a.medals.Silver;
      if (a.medals.Bronze !== b.medals.Bronze) return b.medals.Bronze - a.medals.Bronze;
      return b.medals.Total - a.medals.Total;
    });

    // Assign static ranks based on Olympic-style ranking
    olympicSorted.forEach((team, index) => {
      team.staticRank = index + 1;
    });

    // Apply current sorting based on selected field and direction
    return sortTeams(olympicSorted);
  }, [teams, medals, sortTeams]);

  const isLoading = teamsLoading || medalsLoading;
  const error = teamsError || medalsError;

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode; className?: string }> = ({ field, children, className = "" }) => {
    const isActive = sortField === field;
    return (
      <th 
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          <div className="flex flex-col">
            <svg 
              className={`w-3 h-3 ${isActive && sortDirection === 'asc' ? 'text-primary' : 'text-gray-300'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <svg 
              className={`w-3 h-3 -mt-1 ${isActive && sortDirection === 'desc' ? 'text-primary' : 'text-gray-300'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </th>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Error loading leaderboard"
        message="Please try again later."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-xl text-gray-600">Medal standings and team rankings</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Sort Status */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                Sorted by: <span className="font-medium text-gray-900 capitalize">{sortField}</span>
                <span className="ml-2 text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </span>
              </div>
              {!isDefaultSorting && (
                <button
                  onClick={handleClearSorting}
                  className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                  title="Reset to default sorting (Olympic ranking)"
                >
                  Reset to Default
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {sortedTeams.length} team{sortedTeams.length !== 1 ? 's' : ''} shown
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader field="rank">
                  Rank
                </SortableHeader>
                <SortableHeader field="team">
                  Team
                </SortableHeader>
                <SortableHeader field="gold" className="text-center">
                  🥇 Gold
                </SortableHeader>
                <SortableHeader field="silver" className="text-center">
                  🥈 Silver
                </SortableHeader>
                <SortableHeader field="bronze" className="text-center">
                  🥉 Bronze
                </SortableHeader>
                <SortableHeader field="total" className="text-center">
                  Total
                </SortableHeader>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTeams.map((team) => (
                <tr key={team.ID} className={`hover:bg-gray-50 ${team.staticRank <= 3 ? 'bg-yellow-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-lg font-bold ${
                        team.staticRank === 1 ? 'text-yellow-600' :
                        team.staticRank === 2 ? 'text-gray-500' :
                        team.staticRank === 3 ? 'text-orange-600' :
                        'text-gray-700'
                      }`}>
                        #{team.staticRank}
                      </span>
                      {team.staticRank <= 3 && (
                        <span className="ml-2 text-lg">
                          {team.staticRank === 1 ? '👑' : team.staticRank === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-3">
                        {team.Logo_URL ? (
                          <img 
                            src={team.Logo_URL} 
                            alt={`${team.Name} logo`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-xs font-bold text-gray-500">${getTeamInitials(team.Name)}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-500">
                            {getTeamInitials(team.Name)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{team.Name}</div>
                        <div className="text-sm text-gray-500">{team.Country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-semibold text-yellow-600">{team.medals.Gold}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-semibold text-gray-500">{team.medals.Silver}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-semibold text-orange-600">{team.medals.Bronze}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-bold text-gray-900">{team.medals.Total}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {/* Mobile Sort Controls */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-gray-900">Sort Options</div>
                <div className="text-xs text-gray-500 mt-1">
                  Current: <span className="font-medium capitalize">{sortField}</span>
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isDefaultSorting && (
                  <button
                    onClick={handleClearSorting}
                    className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
                    title="Reset to default sorting (Olympic ranking)"
                  >
                    Reset
                  </button>
                )}
                <div className="text-xs text-gray-500">{sortedTeams.length} teams</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {(['rank', 'team', 'country'] as SortField[]).map((field) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                    sortField === field 
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortField === field && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
              {(['gold', 'silver', 'bronze'] as SortField[]).map((field) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                    sortField === field 
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {field === 'gold' ? '🥇' : field === 'silver' ? '🥈' : '🥉'} {field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortField === field && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
              <button
                onClick={() => handleSort('total')}
                className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                  sortField === 'total' 
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Total
                {sortField === 'total' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-4 p-4">
            {sortedTeams.map((team) => (
              <div key={team.ID} className={`rounded-lg p-4 border ${
                team.staticRank <= 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      team.staticRank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      team.staticRank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      team.staticRank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                      'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}>
                      #{team.staticRank}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{team.Name}</div>
                      <div className="text-sm text-gray-500">{team.Country}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{team.medals.Total}</div>
                    <div className="text-xs text-gray-500">Total Medals</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">🥇</span>
                      <span className="font-bold text-sm">{team.medals.Gold}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-400">🥈</span>
                      <span className="font-bold text-sm">{team.medals.Silver}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-amber-600">🥉</span>
                      <span className="font-bold text-sm">{team.medals.Bronze}</span>
                    </div>
                  </div>
                  {team.staticRank <= 3 && (
                    <div className="text-lg">
                      {team.staticRank === 1 ? '👑' : team.staticRank === 2 ? '🥈' : '🥉'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {sortedTeams.length === 0 && (
        <EmptyState
          title="No medals awarded yet"
          description="Medal standings will appear here as competitions progress."
          icon={
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        />
      )}
    </div>
  );
};

export default Leaderboard; 