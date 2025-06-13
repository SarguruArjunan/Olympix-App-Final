import React, { useState } from 'react';
import { Event } from '../types';
import { useEvents, useSports, useTeams, useCreateEvent, useUpdateEvent, useDeleteEvent } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';
import ResultsModal from './ResultsModal';
import { formatDate, formatTime, findSportName } from '../utils/helpers';

const EventAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [completingEvent, setCompletingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    SportID: '',
    Name: '',
    Date: '',
    Time: '',
    Location: 'Recreation Area',
    TeamA_ID: '',
    TeamB_ID: '',
    Status: 'Scheduled' as 'Scheduled' | 'In Progress' | 'Completed',
    WinnerTeamID: '',
    TeamA_Score: '',
    TeamB_Score: '',
    ResultNotes: ''
  });

  const { data: events, isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: sports, isLoading: sportsLoading } = useSports();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const isLoading = eventsLoading || sportsLoading || teamsLoading;
  const isSubmitting = createEventMutation.isPending || updateEventMutation.isPending;

  // Filter events based on active tab
  const currentEvents = events?.filter(event => 
    !event.Status || event.Status === 'Scheduled' || event.Status === 'In Progress'
  ) || [];
  
  const completedEvents = events?.filter(event => 
    event.Status === 'Completed'
  ) || [];

  const displayedEvents = activeTab === 'current' ? currentEvents : completedEvents;

  const resetForm = () => {
    setFormData({
      SportID: '',
      Name: '',
      Date: '',
      Time: '',
      Location: 'Recreation Area',
      TeamA_ID: '',
      TeamB_ID: '',
      Status: 'Scheduled',
      WinnerTeamID: '',
      TeamA_Score: '',
      TeamB_Score: '',
      ResultNotes: ''
    });
    setEditingEvent(null);
    setIsFormVisible(false);
  };

  const handleEdit = (event: Event) => {
    setFormData({
      SportID: event.SportID.toString(),
      Name: event.Name,
      Date: event.Date,
      Time: event.Time,
      Location: event.Location,
      TeamA_ID: event.TeamA_ID ? event.TeamA_ID.toString() : '',
      TeamB_ID: event.TeamB_ID ? event.TeamB_ID.toString() : '',
      Status: event.Status || 'Scheduled',
      WinnerTeamID: event.WinnerTeamID ? event.WinnerTeamID.toString() : '',
      TeamA_Score: event.TeamA_Score || '',
      TeamB_Score: event.TeamB_Score || '',
      ResultNotes: event.ResultNotes || ''
    });
    setEditingEvent(event);
    setIsFormVisible(true);
    
    // Scroll to top smoothly and focus on first field
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const firstInput = document.getElementById('sport');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  };

  const handleMarkCompleted = (event: Event) => {
    setCompletingEvent(event);
    setResultsModalOpen(true);
  };

  const handleSaveResults = async (results: {
    WinnerTeamID?: number;
    TeamA_Score?: string;
    TeamB_Score?: string;
    ResultNotes?: string;
  }) => {
    if (!completingEvent) return;

    try {
      await updateEventMutation.mutateAsync({ 
        id: completingEvent.ID, 
        data: { 
          ...completingEvent, 
          Status: 'Completed',
          ...results
        }
      });
      
      setResultsModalOpen(false);
      setCompletingEvent(null);
    } catch (error) {
      console.error('Error completing event:', error);
      alert('Failed to complete event');
    }
  };

  const handleCloseResultsModal = () => {
    setResultsModalOpen(false);
    setCompletingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.SportID || !formData.Name || !formData.Date || !formData.Time || !formData.Location) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate winner is required for completed events
    if (formData.Status === 'Completed' && !formData.WinnerTeamID) {
      alert('Winner is required when marking an event as completed');
      return;
    }

    try {
      const eventData = {
        SportID: parseInt(formData.SportID),
        Name: formData.Name,
        Date: formData.Date,
        Time: formData.Time,
        Location: formData.Location,
        TeamA_ID: formData.TeamA_ID ? parseInt(formData.TeamA_ID) : undefined,
        TeamB_ID: formData.TeamB_ID ? parseInt(formData.TeamB_ID) : undefined,
        Status: formData.Status,
        WinnerTeamID: formData.WinnerTeamID ? parseInt(formData.WinnerTeamID) : undefined,
        TeamA_Score: formData.TeamA_Score || undefined,
        TeamB_Score: formData.TeamB_Score || undefined,
        ResultNotes: formData.ResultNotes || undefined
      };

      if (editingEvent) {
        await updateEventMutation.mutateAsync({ id: editingEvent.ID, data: eventData });
      } else {
        await createEventMutation.mutateAsync(eventData);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(editingEvent ? 'Failed to update event' : 'Failed to create event');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await deleteEventMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (eventsError) {
    return (
      <ErrorMessage 
        title="Error loading admin data"
        message="Please try again later."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg text-gray-600">Manage event schedules and details</p>
        </div>
        <button
          onClick={() => {
            setIsFormVisible(!isFormVisible);
            if (!isFormVisible) {
              // Scroll to top smoothly and focus on first field when opening form
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                const firstInput = document.getElementById('sport');
                if (firstInput) {
                  firstInput.focus();
                }
              }, 100);
            }
          }}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          {isFormVisible ? 'Cancel' : 'Add New Event'}
        </button>
      </div>

      {/* Event Form */}
      {isFormVisible && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
                  Sport
                </label>
                <select
                  id="sport"
                  value={formData.SportID}
                  onChange={(e) => setFormData({ ...formData, SportID: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select a sport</option>
                  {sports?.map((sport) => (
                    <option key={sport.ID} value={sport.ID}>
                      {sport.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Men's Final, Women's Semi-Final"
                  required
                />
              </div>

              <div>
                <label htmlFor="teamA" className="block text-sm font-medium text-gray-700 mb-1">
                  Team A (Optional)
                </label>
                <select
                  id="teamA"
                  value={formData.TeamA_ID}
                  onChange={(e) => setFormData({ ...formData, TeamA_ID: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Team A</option>
                  {teams?.map((team) => (
                    <option key={team.ID} value={team.ID}>
                      {team.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="teamB" className="block text-sm font-medium text-gray-700 mb-1">
                  Team B (Optional)
                </label>
                <select
                  id="teamB"
                  value={formData.TeamB_ID}
                  onChange={(e) => setFormData({ ...formData, TeamB_ID: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Team B</option>
                  {teams?.map((team) => (
                    <option key={team.ID} value={team.ID}>
                      {team.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.Date}
                  onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.Time}
                  onChange={(e) => setFormData({ ...formData, Time: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.Status}
                  onChange={(e) => setFormData({ ...formData, Status: e.target.value as 'Scheduled' | 'In Progress' | 'Completed' })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.Location}
                onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Main Stadium, Court 1, Field A"
                required
              />
            </div>

            {/* Results Section - Show only for completed events or when status is set to completed */}
            {(formData.Status === 'Completed' || (editingEvent && editingEvent.Status === 'Completed')) && (
              <div className="col-span-full border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Event Results</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="winner" className="block text-sm font-medium text-gray-700 mb-1">
                      Winner *
                    </label>
                    <select
                      id="winner"
                      value={formData.WinnerTeamID}
                      onChange={(e) => setFormData({ ...formData, WinnerTeamID: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select winner...</option>
                      {formData.TeamA_ID && teams?.find(t => t.ID.toString() === formData.TeamA_ID) && (
                        <option value={formData.TeamA_ID}>
                          {teams.find(t => t.ID.toString() === formData.TeamA_ID)?.Name} (Team A)
                        </option>
                      )}
                      {formData.TeamB_ID && teams?.find(t => t.ID.toString() === formData.TeamB_ID) && (
                        <option value={formData.TeamB_ID}>
                          {teams.find(t => t.ID.toString() === formData.TeamB_ID)?.Name} (Team B)
                        </option>
                      )}
                      {teams?.filter(team => 
                        team.ID.toString() !== formData.TeamA_ID && 
                        team.ID.toString() !== formData.TeamB_ID
                      ).map(team => (
                        <option key={team.ID} value={team.ID}>
                          {team.Name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="teamAScore" className="block text-sm font-medium text-gray-700 mb-1">
                      Team A Score (Optional)
                    </label>
                    <input
                      type="text"
                      id="teamAScore"
                      value={formData.TeamA_Score}
                      onChange={(e) => setFormData({ ...formData, TeamA_Score: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 3, 21-15, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="teamBScore" className="block text-sm font-medium text-gray-700 mb-1">
                      Team B Score (Optional)
                    </label>
                    <input
                      type="text"
                      id="teamBScore"
                      value={formData.TeamB_Score}
                      onChange={(e) => setFormData({ ...formData, TeamB_Score: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 1, 18-21, etc."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="resultNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="resultNotes"
                    rows={3}
                    value={formData.ResultNotes}
                    onChange={(e) => setFormData({ ...formData, ResultNotes: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Any additional notes about the event results..."
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
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

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
        
        {displayedEvents && displayedEvents.length > 0 ? (
          <>
            {/* Mobile Card Layout */}
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {displayedEvents.map((event) => {
                  const teamA = teams?.find(t => t.ID === event.TeamA_ID);
                  const teamB = teams?.find(t => t.ID === event.TeamB_ID);
                  let teamsDisplay = '—';
                  if (teamA && teamB) {
                    teamsDisplay = `${teamA.Name} vs ${teamB.Name}`;
                  } else if (teamA) {
                    teamsDisplay = teamA.Name;
                  } else if (teamB) {
                    teamsDisplay = teamB.Name;
                  }

                  return (
                    <div key={event.ID} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{event.Name}</h3>
                          <p className="text-sm text-gray-600">{findSportName(event.SportID, sports || [])}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.Status === 'Completed' 
                            ? 'bg-green-100 text-green-800'
                            : event.Status === 'In Progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {event.Status || 'Scheduled'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <span className="ml-1 text-gray-900">{formatDate(event.Date)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="ml-1 text-gray-900">{formatTime(event.Time)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Location:</span>
                          <span className="ml-1 text-gray-900">{event.Location}</span>
                        </div>
                        {teamsDisplay !== '—' && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Teams:</span>
                            <span className="ml-1 text-gray-900">{teamsDisplay}</span>
                          </div>
                        )}
                        {/* Show results for completed events */}
                        {event.Status === 'Completed' && (event.WinnerTeamID || event.TeamA_Score || event.TeamB_Score) && (
                          <>
                            {event.WinnerTeamID && (
                              <div className="col-span-2">
                                <span className="text-gray-500">Winner:</span>
                                <span className="ml-1 text-green-600 font-medium">
                                  {teams?.find(t => t.ID === event.WinnerTeamID)?.Name || 'Unknown'}
                                </span>
                              </div>
                            )}
                            {(event.TeamA_Score || event.TeamB_Score) && (
                              <div className="col-span-2">
                                <span className="text-gray-500">Final Score:</span>
                                <span className="ml-1 text-gray-900">
                                  {event.TeamA_Score || '—'} - {event.TeamB_Score || '—'}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => handleEdit(event)}
                          className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                        >
                          Edit
                        </button>
                        {activeTab === 'current' && event.Status !== 'Completed' && (
                          <button
                            onClick={() => handleMarkCompleted(event)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            disabled={updateEventMutation.isPending}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(event.ID)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          disabled={deleteEventMutation.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Details
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Teams
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      Location
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {activeTab === 'completed' && (
                      <>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Winner
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                      </>
                    )}
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedEvents.map((event) => {
                    const teamA = teams?.find(t => t.ID === event.TeamA_ID);
                    const teamB = teams?.find(t => t.ID === event.TeamB_ID);
                    let teamsDisplay = '—';
                    if (teamA && teamB) {
                      teamsDisplay = `${teamA.Name} vs ${teamB.Name}`;
                    } else if (teamA) {
                      teamsDisplay = teamA.Name;
                    } else if (teamB) {
                      teamsDisplay = teamB.Name;
                    }

                    return (
                      <tr key={event.ID} className="hover:bg-gray-50">
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                          #{event.ID}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <div className="font-medium text-gray-900">{event.Name}</div>
                          <div className="text-gray-500">{findSportName(event.SportID, sports || [])}</div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 hidden lg:table-cell">
                          {teamsDisplay}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900">
                          <div>{formatDate(event.Date)}</div>
                          <div className="text-gray-500">{formatTime(event.Time)}</div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 hidden xl:table-cell">
                          {event.Location}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.Status === 'Completed' 
                              ? 'bg-green-100 text-green-800'
                              : event.Status === 'In Progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {event.Status || 'Scheduled'}
                          </span>
                        </td>
                        {activeTab === 'completed' && (
                          <>
                            <td className="px-3 py-3 text-sm">
                              {event.WinnerTeamID ? (
                                <span className="text-green-600 font-medium">
                                  {teams?.find(t => t.ID === event.WinnerTeamID)?.Name || 'Unknown'}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900">
                              {(event.TeamA_Score || event.TeamB_Score) ? 
                                `${event.TeamA_Score || '—'} - ${event.TeamB_Score || '—'}` : 
                                '—'
                              }
                            </td>
                          </>
                        )}
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleEdit(event)}
                              className="text-primary hover:text-primary-dark text-left"
                            >
                              Edit
                            </button>
                            {activeTab === 'current' && event.Status !== 'Completed' && (
                              <button
                                onClick={() => handleMarkCompleted(event)}
                                className="text-green-600 hover:text-green-900 text-left"
                                disabled={updateEventMutation.isPending}
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(event.ID)}
                              className="text-red-600 hover:text-red-900 text-left"
                              disabled={deleteEventMutation.isPending}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState
            title={activeTab === 'current' ? 'No current events' : 'No completed events'}
            description={
              activeTab === 'current'
                ? "Create your first event using the 'Add New Event' button above."
                : "Complete some events to see them here."
            }
            icon={
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        )}
      </div>

      {/* Results Modal */}
      {resultsModalOpen && completingEvent && (
        <ResultsModal
          event={completingEvent}
          teams={teams || []}
          isOpen={resultsModalOpen}
          onSave={handleSaveResults}
          onClose={handleCloseResultsModal}
          isLoading={updateEventMutation.isPending}
        />
      )}
    </div>
  );
};

export default EventAdmin; 