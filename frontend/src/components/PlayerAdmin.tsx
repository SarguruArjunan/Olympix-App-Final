import React, { useState, useMemo } from 'react';
import { Player, Team, Sport } from '../types';
import { usePlayers, useCreatePlayer, useUpdatePlayer, useDeletePlayer, useTeams, useSports } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

const PlayerAdmin: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [sortField, setSortField] = useState<keyof Player>('ID');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    TeamID: 0,
    SportID: 0,
    SecondSportID: 0
  });

  // Data fetching
  const { data: players, isLoading: playersLoading, error: playersError } = usePlayers();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: sports, isLoading: sportsLoading } = useSports();
  
  // Mutations
  const createPlayerMutation = useCreatePlayer();
  const updatePlayerMutation = useUpdatePlayer();
  const deletePlayerMutation = useDeletePlayer();

  const isLoading = playersLoading || teamsLoading || sportsLoading;
  const isSubmitting = createPlayerMutation.isPending || updatePlayerMutation.isPending;

  // Create lookup maps for team and sport names
  const teamLookup = useMemo(() => {
    if (!teams) return {};
    return teams.reduce((acc, team) => ({ ...acc, [team.ID]: team }), {} as Record<number, Team>);
  }, [teams]);

  const sportLookup = useMemo(() => {
    if (!sports) return {};
    return sports.reduce((acc, sport) => ({ ...acc, [sport.ID]: sport }), {} as Record<number, Sport>);
  }, [sports]);

  // Filter and sort players
  const filteredAndSortedPlayers = useMemo(() => {
    if (!players) return [];

    let filtered = players.filter(player => {
      const fullName = `${player.FirstName} ${player.LastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesTeam = !selectedTeam || player.TeamID.toString() === selectedTeam;
      const matchesSport = !selectedSport || player.SportID.toString() === selectedSport;
      
      return matchesSearch && matchesTeam && matchesSport;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      // For string fields, convert to lowercase for case-insensitive sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [players, searchTerm, selectedTeam, selectedSport, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPlayers.length / itemsPerPage);
  const paginatedPlayers = filteredAndSortedPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetForm = () => {
    setFormData({
      FirstName: '',
      LastName: '',
      TeamID: 0,
      SportID: 0,
      SecondSportID: 0
    });
    setEditingPlayer(null);
    setIsFormVisible(false);
  };

  const handleEdit = (player: Player) => {
    setFormData({
      FirstName: player.FirstName,
      LastName: player.LastName,
      TeamID: player.TeamID,
      SportID: player.SportID,
      SecondSportID: player.SecondSportID || 0
    });
    setEditingPlayer(player);
    setIsFormVisible(true);
    
    // Scroll to top smoothly and focus on first field
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const firstInput = document.getElementById('firstName');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.FirstName || !formData.LastName || !formData.TeamID || !formData.SportID) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate that second sport is different from first sport
    if (formData.SecondSportID && formData.SecondSportID === formData.SportID) {
      alert('Second sport must be different from the first sport');
      return;
    }

    try {
      const playerData: any = {
        FirstName: formData.FirstName.trim(),
        LastName: formData.LastName.trim(),
        TeamID: formData.TeamID,
        SportID: formData.SportID
      };

      // Only include SecondSportID if it's actually selected (not 0)
      if (formData.SecondSportID && formData.SecondSportID !== 0) {
        playerData.SecondSportID = formData.SecondSportID;
      }

      if (editingPlayer) {
        await updatePlayerMutation.mutateAsync({ id: editingPlayer.ID, data: playerData });
      } else {
        await createPlayerMutation.mutateAsync(playerData);
      }

      resetForm();
    } catch (error: any) {
      console.error('Error saving player:', error);
      alert(error?.response?.data?.error || `Failed to ${editingPlayer ? 'update' : 'create'} player`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this player?')) {
      return;
    }

    try {
      await deletePlayerMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Failed to delete player');
    }
  };

  const handleSort = (field: keyof Player) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (playersError) {
    return (
      <ErrorMessage 
        title="Error loading players"
        message="Please try again later."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg text-gray-600">Manage player information and assignments</p>
        </div>
        <button
          onClick={() => {
            setIsFormVisible(!isFormVisible);
            if (!isFormVisible) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                const firstInput = document.getElementById('firstName');
                if (firstInput) {
                  firstInput.focus();
                }
              }, 100);
            }
          }}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          {isFormVisible ? 'Cancel' : 'Add New Player'}
        </button>
      </div>

      {/* Player Form */}
      {isFormVisible && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {editingPlayer ? 'Edit Player' : 'Add New Player'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.FirstName}
                  onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.LastName}
                  onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div>
                <label htmlFor="teamSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Team *
                </label>
                <select
                  id="teamSelect"
                  value={formData.TeamID}
                  onChange={(e) => setFormData({ ...formData, TeamID: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value={0}>Select a team</option>
                  {teams?.map((team) => (
                    <option key={team.ID} value={team.ID}>
                      {team.Name} - {team.Organization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sportSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Sport *
                </label>
                <select
                  id="sportSelect"
                  value={formData.SportID}
                  onChange={(e) => setFormData({ ...formData, SportID: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value={0}>Select a sport</option>
                  {sports?.map((sport) => (
                    <option key={sport.ID} value={sport.ID}>
                      {sport.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="secondSportSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Second Sport (Optional)
                </label>
                <select
                  id="secondSportSelect"
                  value={formData.SecondSportID}
                  onChange={(e) => setFormData({ ...formData, SecondSportID: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={0}>Select second sport (optional)</option>
                  {sports?.map((sport) => (
                    <option
                      key={sport.ID}
                      value={sport.ID}
                      disabled={sport.ID === formData.SportID} // Disable if same as first sport
                    >
                      {sport.Name}
                    </option>
                  ))}
                </select>
                {formData.SecondSportID === formData.SportID && formData.SecondSportID !== 0 && (
                  <p className="text-red-500 text-sm mt-1">Second sport must be different from the first sport</p>
                )}
              </div>
            </div>

            <div className="flex space-x-4 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingPlayer ? 'Update Player' : 'Create Player'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter Players</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search by name
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Type player name..."
            />
          </div>

          <div>
            <label htmlFor="teamFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by team
            </label>
            <select
              id="teamFilter"
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All teams</option>
              {teams?.map((team) => (
                <option key={team.ID} value={team.ID.toString()}>
                  {team.Name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sportFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by sport
            </label>
            <select
              id="sportFilter"
              value={selectedSport}
              onChange={(e) => {
                setSelectedSport(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All sports</option>
              {sports?.map((sport) => (
                <option key={sport.ID} value={sport.ID.toString()}>
                  {sport.Name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700 mb-1">
              Items per page
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || selectedTeam || selectedSport) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTeam('');
                setSelectedSport('');
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            Players ({filteredAndSortedPlayers.length} total)
          </h3>
          
          {/* Results info */}
          <div className="text-sm text-gray-500">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedPlayers.length)} - {Math.min(currentPage * itemsPerPage, filteredAndSortedPlayers.length)} of {filteredAndSortedPlayers.length} results
          </div>
        </div>
        
        {filteredAndSortedPlayers.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('ID')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>ID</span>
                        {sortField === 'ID' && (
                          <span className="text-primary">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('FirstName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {sortField === 'FirstName' && (
                          <span className="text-primary">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sport
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedPlayers.map((player) => (
                    <tr key={player.ID} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                        #{player.ID}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {player.FirstName} {player.LastName}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {teamLookup[player.TeamID]?.Name || 'Unknown Team'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {teamLookup[player.TeamID]?.Organization}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div>{sportLookup[player.SportID]?.Name || 'Unknown Sport'}</div>
                        {player.SecondSportID && (
                          <div className="text-xs text-gray-500">
                            + {sportLookup[player.SecondSportID]?.Name || 'Unknown Sport'}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(player)}
                            className="text-primary hover:text-primary-dark"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(player.ID)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {paginatedPlayers.map((player) => (
                  <div key={player.ID} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {player.FirstName} {player.LastName}
                        </h4>
                        <p className="text-sm text-gray-500">ID: #{player.ID}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(player)}
                          className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(player.ID)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Team:</span>
                        <div className="text-gray-900">{teamLookup[player.TeamID]?.Name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{teamLookup[player.TeamID]?.Organization}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Sports:</span>
                        <div className="text-gray-900">{sportLookup[player.SportID]?.Name || 'Unknown'}</div>
                        {player.SecondSportID && (
                          <div className="text-xs text-gray-500">
                            + {sportLookup[player.SecondSportID]?.Name || 'Unknown'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === page
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No players found"
            description={
              searchTerm || selectedTeam || selectedSport
                ? "No players match your current filters. Try adjusting your search criteria."
                : "No players have been added yet. Create your first player to get started."
            }
            actionButton={
              !searchTerm && !selectedTeam && !selectedSport ? (
                <button
                  onClick={() => setIsFormVisible(true)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Add Player
                </button>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
};

export default PlayerAdmin;