import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayers, useTeams, useSports, useMedals } from '../hooks/useApi';
import { Player, Team, Sport, Medal } from '../types';
import { getTeamInitials } from '../utils/helpers';

interface StarPlayer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  teamId: number;
  teamName: string;
  teamCountry: string;
  teamOrganization: string;
  teamColor: string;
  teamLogo: string;
  sportId: number;
  sportName: string;
  sportIcon: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  medalScore: number; // For sorting: gold*5 + silver*3 + bronze*1
  staticRank: number; // Static rank based on medal score - never changes
}

type SortField = 'rank' | 'player' | 'team' | 'sport' | 'gold' | 'silver' | 'bronze' | 'total' | 'score';
type SortDirection = 'asc' | 'desc';

const StarPlayers: React.FC = () => {
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: sports = [], isLoading: sportsLoading } = useSports();
  const { data: medals = [], isLoading: medalsLoading } = useMedals();
  
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'score' || field === 'gold' || field === 'silver' || field === 'bronze' || field === 'total' ? 'desc' : 'asc');
    }
  };

  const handleClearSorting = () => {
    setSortField('score');
    setSortDirection('desc');
  };

  const isDefaultSorting = sortField === 'score' && sortDirection === 'desc';

  const sortPlayers = (players: StarPlayer[]): StarPlayer[] => {
    return [...players].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'rank':
          // For rank, we use the static rank (which is based on medal score)
          aValue = a.staticRank;
          bValue = b.staticRank;
          break;
        case 'player':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'team':
          aValue = a.teamName.toLowerCase();
          bValue = b.teamName.toLowerCase();
          break;
        case 'sport':
          aValue = a.sportName.toLowerCase();
          bValue = b.sportName.toLowerCase();
          break;
        case 'gold':
          aValue = a.gold;
          bValue = b.gold;
          break;
        case 'silver':
          aValue = a.silver;
          bValue = b.silver;
          break;
        case 'bronze':
          aValue = a.bronze;
          bValue = b.bronze;
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'score':
          aValue = a.medalScore;
          bValue = b.medalScore;
          break;
        default:
          aValue = a.medalScore;
          bValue = b.medalScore;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      
      // Secondary sort by name for ties
      if (a.fullName < b.fullName) return -1;
      if (a.fullName > b.fullName) return 1;
      return 0;
    });
  };

  const starPlayers = useMemo((): StarPlayer[] => {
    if (!players.length || !teams.length || !sports.length || !medals.length) {
      return [];
    }

    const starPlayersList: StarPlayer[] = [];

    players.forEach((player: Player) => {
      const team = teams.find((t: Team) => t.ID === player.TeamID);
      const sport = sports.find((s: Sport) => s.ID === player.SportID);
      const teamMedals = medals.find((m: Medal) => m.TeamID === player.TeamID && m.SportID === player.SportID);

      if (team && sport && teamMedals && teamMedals.Total > 0) {
        const medalScore = (teamMedals.Gold * 5) + (teamMedals.Silver * 3) + (teamMedals.Bronze * 1);
        
        starPlayersList.push({
          id: player.ID!,
          firstName: player.FirstName,
          lastName: player.LastName,
          fullName: `${player.FirstName} ${player.LastName}`,
          teamId: team.ID,
          teamName: team.Name,
          teamCountry: team.Country,
          teamOrganization: team.Organization,
          teamColor: team.Color,
          teamLogo: team.Logo_URL,
          sportId: sport.ID,
          sportName: sport.Name,
          sportIcon: sport.Icon_URL,
          gold: teamMedals.Gold,
          silver: teamMedals.Silver,
          bronze: teamMedals.Bronze,
          total: teamMedals.Total,
          medalScore: medalScore,
          staticRank: 0 // Will be assigned after sorting
        });
      }
    });

    // First, sort by medal score to determine static ranks
    const sortedByScore = starPlayersList.sort((a, b) => {
      if (b.medalScore !== a.medalScore) return b.medalScore - a.medalScore;
      if (b.total !== a.total) return b.total - a.total;
      return a.fullName.localeCompare(b.fullName);
    });

    // Assign static ranks based on medal score ranking
    sortedByScore.forEach((player, index) => {
      player.staticRank = index + 1;
    });

    // Apply current sorting based on selected field and direction
    return sortPlayers(sortedByScore);
  }, [players, teams, sports, medals, sortPlayers]);

  const isLoading = playersLoading || teamsLoading || sportsLoading || medalsLoading;

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
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-primary mb-2">Star Players</h1>
      <p className="text-gray-600 mb-8">Top performers with medals in their respective sports</p>
      
      {starPlayers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Star Players Yet</h2>
          <p className="text-gray-500">Players will appear here once teams start winning medals!</p>
        </div>
      ) : (
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
                    title="Reset to default sorting (Score, descending)"
                  >
                    Reset to Default
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {starPlayers.length} player{starPlayers.length !== 1 ? 's' : ''} shown
              </div>
            </div>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader field="rank">
                    Rank
                  </SortableHeader>
                  <SortableHeader field="player">
                    Player
                  </SortableHeader>
                  <SortableHeader field="team">
                    Team
                  </SortableHeader>
                  <SortableHeader field="sport">
                    Sport
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
                  <SortableHeader field="score" className="text-center">
                    Score
                  </SortableHeader>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {starPlayers.map((player, index) => (
                  <tr key={player.id} className={`hover:bg-gray-50 ${player.staticRank <= 3 ? 'bg-yellow-50' : ''}`}>
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          player.staticRank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          player.staticRank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                          player.staticRank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                          'bg-gradient-to-br from-blue-400 to-blue-600'
                        }`}>
                          {player.staticRank}
                        </div>
                      </div>
                    </td>

                    {/* Player */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-bold text-gray-900">{player.fullName}</div>
                        <div className="text-gray-500">#{player.id}</div>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/teams/${player.teamId}`} className="flex items-center space-x-3 hover:text-primary-dark group">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {player.teamLogo ? (
                            <img
                              src={player.teamLogo}
                              alt={`${player.teamName} logo`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs" style="background-color: ${player.teamColor}">${getTeamInitials(player.teamName)}</div>`;
                                }
                              }}
                            />
                          ) : (
                            <div 
                              className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs"
                              style={{ backgroundColor: player.teamColor }}
                            >
                              {getTeamInitials(player.teamName)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-primary-dark">
                            {player.teamName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {player.teamCountry}
                          </div>
                          <div className="text-xs text-gray-400">
                            {player.teamOrganization}
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Sport */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/sports/${player.sportId}`} className="flex items-center space-x-3 hover:text-primary-dark group">
                        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {player.sportIcon ? (
                            <img
                              src={player.sportIcon}
                              alt={`${player.sportName} icon`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full rounded-lg flex items-center justify-center text-gray-600 font-bold text-xs">${player.sportName.charAt(0).toUpperCase()}</div>`;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full rounded-lg flex items-center justify-center text-gray-600 font-bold text-xs">
                              {player.sportName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-900 group-hover:text-primary-dark">
                          {player.sportName}
                        </div>
                      </Link>
                    </td>

                    {/* Medals */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        player.gold > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {player.gold}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        player.silver > 0 ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {player.silver}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        player.bronze > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {player.bronze}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                        {player.total}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-bold text-gray-900">
                        {player.medalScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
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
                      title="Reset to default sorting (Score, descending)"
                    >
                      Reset
                    </button>
                  )}
                  <div className="text-xs text-gray-500">{starPlayers.length} players</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['player', 'team', 'sport'] as SortField[]).map((field) => (
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
                {(['total', 'score', 'rank'] as SortField[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                      sortField === field 
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {field === 'total' ? 'Total' : field === 'score' ? 'Score' : 'Rank'}
                    {sortField === field && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4 p-4">
              {starPlayers.map((player, index) => (
                <div key={player.id} className={`rounded-lg p-4 border ${
                  player.staticRank <= 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        player.staticRank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        player.staticRank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                        player.staticRank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                        'bg-gradient-to-br from-blue-400 to-blue-600'
                      }`}>
                        #{player.staticRank}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{player.fullName}</div>
                        <div className="text-sm text-gray-500">Player #{player.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{player.total}</div>
                      <div className="text-xs text-gray-500">Total Medals</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Link to={`/teams/${player.teamId}`} className="flex items-center space-x-2 hover:text-primary-dark">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {player.teamLogo ? (
                          <img
                            src={player.teamLogo}
                            alt={`${player.teamName} logo`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs" style="background-color: ${player.teamColor}">${getTeamInitials(player.teamName)}</div>`;
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: player.teamColor }}
                          >
                            {getTeamInitials(player.teamName)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{player.teamName}</div>
                        <div className="text-xs text-gray-500">{player.teamCountry}</div>
                      </div>
                    </Link>

                    <Link to={`/sports/${player.sportId}`} className="flex items-center space-x-2 hover:text-primary-dark">
                      <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {player.sportIcon ? (
                          <img
                            src={player.sportIcon}
                            alt={`${player.sportName} icon`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full rounded-lg flex items-center justify-center text-gray-600 font-bold text-xs">${player.sportName.charAt(0).toUpperCase()}</div>`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full rounded-lg flex items-center justify-center text-gray-600 font-bold text-xs">
                            {player.sportName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">{player.sportName}</div>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">🥇</span>
                        <span className="font-bold text-sm">{player.gold}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-400">🥈</span>
                        <span className="font-bold text-sm">{player.silver}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-amber-600">🥉</span>
                        <span className="font-bold text-sm">{player.bronze}</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Score: </span>
                      <span className="font-bold text-gray-900">{player.medalScore}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarPlayers; 