import React, { useState, useEffect } from 'react';
import { Medal } from '../types';
import { useMedals, useCreateMedal, useUpdateMedal, useDeleteMedal, useTeams, useSports, useCreatePlayer, usePlayers, useDeletePlayer } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

const MedalsAdmin: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingMedal, setEditingMedal] = useState<Medal | null>(null);
  const [formData, setFormData] = useState({
    TeamID: '',
    SportID: '',
    Gold: 0,
    Silver: 0,
    Bronze: 0,
    Total: 0
  });
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const { data: medals, isLoading: medalsLoading, error: medalsError } = useMedals();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: sports, isLoading: sportsLoading } = useSports();
  const { data: players, isLoading: playersLoading } = usePlayers();
  const createMedalMutation = useCreateMedal();
  const updateMedalMutation = useUpdateMedal();
  const deleteMedalMutation = useDeleteMedal();
  const createPlayerMutation = useCreatePlayer();
  const deletePlayerMutation = useDeletePlayer();

  const isLoading = medalsLoading || teamsLoading || sportsLoading || playersLoading;
  const isSubmitting = createMedalMutation.isPending || updateMedalMutation.isPending;

  // Get existing players for the selected team/sport combination
  const existingPlayers = players?.filter(player =>
    formData.TeamID && formData.SportID &&
    player.TeamID === parseInt(formData.TeamID) &&
    player.SportID === parseInt(formData.SportID)
  ) || [];

  // Get filtered players for the dropdown (including both primary and secondary sports)
  const getFilteredPlayers = () => {
    if (!players || !formData.TeamID || !formData.SportID) {
      return [];
    }

    const teamId = parseInt(formData.TeamID);
    const sportId = parseInt(formData.SportID);

    return players.filter(player =>
      player.TeamID === teamId &&
      (player.SportID === sportId || player.SecondSportID === sportId)
    );
  };

  const filteredPlayers = getFilteredPlayers();

  // Auto-calculate total when individual medal counts change
  useEffect(() => {
    const gold = Number(formData.Gold) || 0;
    const silver = Number(formData.Silver) || 0;
    const bronze = Number(formData.Bronze) || 0;
    const total = gold + silver + bronze;
    
    if (total !== formData.Total) {
      setFormData(prev => ({ ...prev, Total: total }));
    }
  }, [formData.Gold, formData.Silver, formData.Bronze, formData.Total]);

  // Clear selected players when team or sport changes
  useEffect(() => {
    setSelectedPlayerIds([]);
  }, [formData.TeamID, formData.SportID]);

  const resetForm = () => {
    setFormData({
      TeamID: '',
      SportID: '',
      Gold: 0,
      Silver: 0,
      Bronze: 0,
      Total: 0
    });
    setSelectedPlayerIds([]);
    setEditingMedal(null);
    setIsFormVisible(false);
  };

  const handleEdit = (medal: Medal) => {
    setFormData({
      TeamID: medal.TeamID.toString(),
      SportID: medal.SportID.toString(),
      Gold: medal.Gold,
      Silver: medal.Silver,
      Bronze: medal.Bronze,
      Total: medal.Total
    });
    setEditingMedal(medal);
    setIsFormVisible(true);
    
    // Scroll to top smoothly and focus on first field
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const firstInput = document.getElementById('team');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  };

  const handlePlayerSelection = (index: number, playerId: string) => {
    const newSelectedPlayerIds = [...selectedPlayerIds];
    newSelectedPlayerIds[index] = playerId;
    setSelectedPlayerIds(newSelectedPlayerIds);
  };

  const handleDeletePlayer = async (playerId: number) => {
    if (!window.confirm('Are you sure you want to remove this player?')) {
      return;
    }

    try {
      await deletePlayerMutation.mutateAsync(playerId);
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Failed to remove player');
    }
  };

  const logSelectedPlayers = () => {
    // Log the selected players for debugging
    const validSelectedPlayerIds = selectedPlayerIds.filter(id => id && id !== '');
    if (validSelectedPlayerIds.length > 0) {
      console.log(`Selected existing player IDs: ${validSelectedPlayerIds.join(', ')}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.TeamID || !formData.SportID) {
      alert('Please select both team and sport');
      return;
    }

    // Validate that at least one medal type has a value greater than 0
    if (formData.Gold === 0 && formData.Silver === 0 && formData.Bronze === 0) {
      alert('At least one medal type (Gold, Silver, or Bronze) must have a value greater than 0');
      return;
    }

    // Check for duplicate medal entries (only for new medals, not edits)
    if (!editingMedal && medals) {
      const duplicate = medals.find(medal => 
        medal.TeamID === parseInt(formData.TeamID) && 
        medal.SportID === parseInt(formData.SportID)
      );
      
      if (duplicate) {
        const teamName = teams?.find(t => t.ID === parseInt(formData.TeamID))?.Name || 'Unknown Team';
        const sportName = sports?.find(s => s.ID === parseInt(formData.SportID))?.Name || 'Unknown Sport';
        
        const shouldEdit = window.confirm(
          `A medal entry already exists for ${teamName} in ${sportName}.\n\n` +
          `Current medals: ${duplicate.Gold} Gold, ${duplicate.Silver} Silver, ${duplicate.Bronze} Bronze\n\n` +
          `Would you like to edit the existing entry instead?`
        );
        
        if (shouldEdit) {
          handleEdit(duplicate);
        }
        return;
      }
    }

    try {
      // Ensure all values are properly converted to integers
      const teamID = parseInt(formData.TeamID, 10);
      const sportID = parseInt(formData.SportID, 10);
      const gold = Math.floor(Number(formData.Gold)) || 0;
      const silver = Math.floor(Number(formData.Silver)) || 0;
      const bronze = Math.floor(Number(formData.Bronze)) || 0;
      const total = gold + silver + bronze; // Always recalculate to ensure accuracy

      // Additional validation to ensure all values are valid integers
      if (isNaN(teamID) || isNaN(sportID) || teamID <= 0 || sportID <= 0) {
        alert('Please select valid team and sport');
        return;
      }

      if (gold < 0 || silver < 0 || bronze < 0) {
        alert('Medal counts cannot be negative');
        return;
      }

      const medalData = {
        TeamID: teamID,
        SportID: sportID,
        Gold: gold,
        Silver: silver,
        Bronze: bronze,
        Total: total
      };

      // Debug logging
      console.log('Sending medal data:', medalData);

      if (editingMedal) {
        await updateMedalMutation.mutateAsync({ id: editingMedal.ID, data: medalData });
      } else {
        // Create medal
        await createMedalMutation.mutateAsync(medalData);
      }

      // Log selected players for debugging
      logSelectedPlayers();

      resetForm();
    } catch (error: any) {
      console.error('Error saving medal:', error);
      console.error('Full error object:', error);
      
      // Provide more specific error messages
      let errorMessage = editingMedal ? 'Failed to update medal' : 'Failed to create medal';
      
      // Check for various error response formats
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage += ': ' + error.message;
      } else if (error?.response?.status === 400) {
        errorMessage = 'Invalid data provided. Please check all fields and try again.';
      }
      
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this medal record?')) {
      return;
    }

    try {
      await deleteMedalMutation.mutateAsync(id);
    } catch (error: any) {
      console.error('Error deleting medal:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to delete medal';
      
      // Check for specific error types
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        if (error.message.includes('not found') || error.message.includes('Not found')) {
          errorMessage = 'This medal record has already been deleted or no longer exists.';
        } else {
          errorMessage = `Failed to delete medal: ${error.message}`;
        }
      } else if (error?.response?.status === 404) {
        errorMessage = 'This medal record has already been deleted or no longer exists.';
      }
      
      alert(errorMessage);
    }
  };

  const getTeamName = (teamId: number) => {
    return teams?.find(team => team.ID === teamId)?.Name || 'Unknown Team';
  };

  const getSportName = (sportId: number) => {
    return sports?.find(sport => sport.ID === sportId)?.Name || 'Unknown Sport';
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (medalsError) {
    return (
      <ErrorMessage 
        title="Error loading medals"
        message="Please try again later."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg text-gray-600">Manage medal awards and standings</p>
        </div>
        <button
          onClick={() => {
            setIsFormVisible(!isFormVisible);
            if (!isFormVisible) {
              // Scroll to top smoothly and focus on first field when opening form
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                const firstInput = document.getElementById('team');
                if (firstInput) {
                  firstInput.focus();
                }
              }, 100);
            }
          }}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          {isFormVisible ? 'Cancel' : 'Add New Medal'}
        </button>
      </div>

      {/* Medal Form */}
      {isFormVisible && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {editingMedal ? 'Edit Medal' : 'Add New Medal'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team and Sport Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
                  Team *
                </label>
                <select
                  id="team"
                  value={formData.TeamID}
                  onChange={(e) => setFormData({ ...formData, TeamID: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select a team...</option>
                  {teams?.map(team => (
                    <option key={team.ID} value={team.ID}>
                      {team.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
                  Sport *
                </label>
                <select
                  id="sport"
                  value={formData.SportID}
                  onChange={(e) => setFormData({ ...formData, SportID: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select a sport...</option>
                  {sports?.map(sport => (
                    <option key={sport.ID} value={sport.ID}>
                      {sport.Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Medal Counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="gold" className="block text-sm font-medium text-gray-700 mb-1">
                  🥇 Gold Medals
                </label>
                <input
                  type="number"
                  id="gold"
                  min="0"
                  step="1"
                  value={formData.Gold === 0 ? '' : formData.Gold}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value === '' ? 0 : Math.max(0, parseInt(value, 10));
                    setFormData({ ...formData, Gold: isNaN(numericValue) ? 0 : numericValue });
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setFormData({ ...formData, Gold: 0 });
                    }
                  }}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="silver" className="block text-sm font-medium text-gray-700 mb-1">
                  🥈 Silver Medals
                </label>
                <input
                  type="number"
                  id="silver"
                  min="0"
                  step="1"
                  value={formData.Silver === 0 ? '' : formData.Silver}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value === '' ? 0 : Math.max(0, parseInt(value, 10));
                    setFormData({ ...formData, Silver: isNaN(numericValue) ? 0 : numericValue });
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setFormData({ ...formData, Silver: 0 });
                    }
                  }}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="bronze" className="block text-sm font-medium text-gray-700 mb-1">
                  🥉 Bronze Medals
                </label>
                <input
                  type="number"
                  id="bronze"
                  min="0"
                  step="1"
                  value={formData.Bronze === 0 ? '' : formData.Bronze}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value === '' ? 0 : Math.max(0, parseInt(value, 10));
                    setFormData({ ...formData, Bronze: isNaN(numericValue) ? 0 : numericValue });
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setFormData({ ...formData, Bronze: 0 });
                    }
                  }}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="total" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Medals
                </label>
                <input
                  type="number"
                  id="total"
                  value={formData.Total}
                  readOnly
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
              </div>
            </div>

            {/* Player Management Section - Show for both new and editing medals */}
            {formData.TeamID && formData.SportID && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {editingMedal ? 'Manage Players' : 'Add Players (Optional)'}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {editingMedal ? `${existingPlayers.length} existing` : 'Up to 8 players'}
                  </span>
                </div>

                {/* Show existing players when editing */}
                {editingMedal && existingPlayers.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-md font-medium text-gray-800 mb-3">Current Players</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {existingPlayers.map((player) => (
                        <div key={player.ID} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-900">
                            {player.FirstName} {player.LastName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeletePlayer(player.ID)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            disabled={deletePlayerMutation.isPending}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add new players section */}
                <div>
                  <h5 className="text-md font-medium text-gray-800 mb-3">
                    {editingMedal ? 'Add New Players' : 'Player Names'}
                  </h5>
                  <p className="text-sm text-gray-600 mb-4">
                    {editingMedal 
                      ? 'Add additional players who contributed to these medals.'
                      : 'Add player names who contributed to these medals. They will appear on the Star Players page.'
                    }
                  </p>
                  
                  {!formData.TeamID || !formData.SportID ? (
                    <div className="text-center py-8">
                      <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500 text-sm">
                        Please select team and sport first to see available players
                      </div>
                    </div>
                  ) : filteredPlayers.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-yellow-50 text-yellow-800 text-sm">
                        No players available for this team and sport combination
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Players must be added through the Players admin page first
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Select from {filteredPlayers.length} available player(s):
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedPlayerIds([])}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear All
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredPlayers.map((player, index) => (
                          <div key={player.ID}>
                            <label htmlFor={`player-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Player {index + 1}
                            </label>
                            <select
                              id={`player-${index}`}
                              value={selectedPlayerIds[index] || ''}
                              onChange={(e) => handlePlayerSelection(index, e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              <option value="">Not selected</option>
                              {filteredPlayers.map((availablePlayer) => (
                                <option
                                  key={availablePlayer.ID}
                                  value={availablePlayer.ID.toString()}
                                  disabled={selectedPlayerIds.includes(availablePlayer.ID.toString()) && selectedPlayerIds[index] !== availablePlayer.ID.toString()}
                                >
                                  {availablePlayer.FirstName} {availablePlayer.LastName}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-green-50 rounded-md">
                        <p className="text-sm text-green-800">
                          💡 <strong>Note:</strong> Each player can only be selected once. Selected players will be associated with this medal record.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Enhanced Player Selection:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• The system dynamically creates dropdowns for all players matching the selected team and sport</li>
                      <li>• Each player can only be selected once to prevent duplicates</li>
                      <li>• Selected players will be associated with this medal record and appear on the Star Players page</li>
                      <li>• Players must be added through the Players admin page before they can be selected here</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingMedal ? 'Update Medal' : 'Create Medal & Players'}
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

      {/* Medals Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Medal Records</h3>
        </div>
        
        {medals && medals.length > 0 ? (
          <>
            {/* Mobile Card Layout */}
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {medals.map((medal) => (
                  <div key={medal.ID} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{getTeamName(medal.TeamID)}</h4>
                        <p className="text-sm text-gray-600">{getSportName(medal.SportID)}</p>
                      </div>
                      <span className="text-sm text-gray-500">#{medal.ID}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🥇</span>
                        <span className="font-medium">{medal.Gold}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🥈</span>
                        <span className="font-medium">{medal.Silver}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🥉</span>
                        <span className="font-medium">{medal.Bronze}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-bold text-lg">{medal.Total}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(medal)}
                        className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(medal.ID)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={deleteMedalMutation.isPending}
                      >
                        {deleteMedalMutation.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sport
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      🥇 Gold
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      🥈 Silver
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      🥉 Bronze
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medals.map((medal) => (
                    <tr key={medal.ID} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                        #{medal.ID}
                      </td>
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">
                        {getTeamName(medal.TeamID)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {getSportName(medal.SportID)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                          {medal.Gold}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-800 rounded-full font-bold">
                          {medal.Silver}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-800 rounded-full font-bold">
                          {medal.Bronze}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-lg font-bold text-gray-900">{medal.Total}</span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleEdit(medal)}
                            className="text-primary hover:text-primary-dark text-left"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(medal.ID)}
                            className="text-red-600 hover:text-red-900 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={deleteMedalMutation.isPending}
                          >
                            {deleteMedalMutation.isPending ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState
            title="No medal records found"
            description="Create your first medal record using the 'Add New Medal' button above."
            icon={
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  );
};

export default MedalsAdmin; 