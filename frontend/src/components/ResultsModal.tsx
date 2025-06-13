import React, { useState } from 'react';
import { Event } from '../types';

interface ResultsModalProps {
  event: Event;
  teams: any[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (results: {
    WinnerTeamID?: number;
    TeamA_Score?: string;
    TeamB_Score?: string;
    ResultNotes?: string;
  }) => void;
  isLoading?: boolean;
}

const ResultsModal: React.FC<ResultsModalProps> = ({
  event,
  teams,
  isOpen,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [winnerTeamID, setWinnerTeamID] = useState<number | undefined>(undefined);
  const [hasSelectedWinner, setHasSelectedWinner] = useState<boolean>(false);
  const [teamAScore, setTeamAScore] = useState<string>('');
  const [teamBScore, setTeamBScore] = useState<string>('');
  const [resultNotes, setResultNotes] = useState<string>('');

  const teamA = teams.find(t => t.ID === event.TeamA_ID);
  const teamB = teams.find(t => t.ID === event.TeamB_ID);

  const handleSave = () => {
    // Validate that a winner selection has been made
    if (!hasSelectedWinner) {
      alert('Please select a winner or mark as draw/no winner before completing the event');
      return;
    }

    const results = {
      WinnerTeamID: winnerTeamID,
      TeamA_Score: teamAScore.trim() || undefined,
      TeamB_Score: teamBScore.trim() || undefined,
      ResultNotes: resultNotes.trim() || undefined
    };
    
    onSave(results);
  };

  const handleClose = () => {
    // Reset form
    setWinnerTeamID(undefined);
    setHasSelectedWinner(false);
    setTeamAScore('');
    setTeamBScore('');
    setResultNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Event Results</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Event Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{event.Name}</h3>
            <p className="text-sm text-gray-600">Complete this event and record the results</p>
          </div>

          {/* Winner Selection - Only show if there are teams */}
          {(teamA || teamB) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Winner *
              </label>
              <div className="space-y-3">
                {teamA && (
                  <div
                    onClick={() => {
                      setWinnerTeamID(teamA.ID);
                      setHasSelectedWinner(true);
                    }}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      winnerTeamID === teamA.ID
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{teamA.Name}</h4>
                        <p className="text-sm text-gray-500">{teamA.Country}</p>
                      </div>
                      {winnerTeamID === teamA.ID && (
                        <div className="text-green-500">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {teamB && (
                  <div
                    onClick={() => {
                      setWinnerTeamID(teamB.ID);
                      setHasSelectedWinner(true);
                    }}
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      winnerTeamID === teamB.ID
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{teamB.Name}</h4>
                        <p className="text-sm text-gray-500">{teamB.Country}</p>
                      </div>
                      {winnerTeamID === teamB.ID && (
                        <div className="text-green-500">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No Winner Option */}
                <div
                  onClick={() => {
                    setWinnerTeamID(undefined);
                    setHasSelectedWinner(true);
                  }}
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                    winnerTeamID === undefined && hasSelectedWinner
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">No Winner / Draw</h4>
                      <p className="text-sm text-gray-500">Event completed without a clear winner</p>
                    </div>
                    {winnerTeamID === undefined && hasSelectedWinner && (
                      <div className="text-blue-500">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-11a1 1 0 112 0v2a1 1 0 11-2 0V7z"
                            clipRule="evenodd"
                          />
                          <path d="M10 15a1 1 0 100-2 1 1 0 000 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Score Input - Only show if there are teams */}
          {(teamA || teamB) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Scores (Optional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {teamA && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {teamA.Name}
                    </label>
                    <input
                      type="text"
                      value={teamAScore}
                      onChange={(e) => setTeamAScore(e.target.value)}
                      placeholder="e.g., 2-1, 15-12, etc."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                )}
                
                {teamB && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {teamB.Name}
                    </label>
                    <input
                      type="text"
                      value={teamBScore}
                      onChange={(e) => setTeamBScore(e.target.value)}
                      placeholder="e.g., 1-2, 12-15, etc."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              value={resultNotes}
              onChange={(e) => setResultNotes(e.target.value)}
              placeholder="Any additional information about the event results..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Complete Event'}
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal; 