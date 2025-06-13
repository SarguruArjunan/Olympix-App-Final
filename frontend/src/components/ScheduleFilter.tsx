import React from 'react';
import { Sport } from '../types';

interface ScheduleFilterProps {
  sports: Sport[];
  selectedSport: number | null;
  selectedDate: string | null;
  onSportChange: (sportId: number | null) => void;
  onDateChange: (date: string | null) => void;
}

const ScheduleFilter: React.FC<ScheduleFilterProps> = ({
  sports,
  selectedSport,
  selectedDate,
  onSportChange,
  onDateChange,
}) => {
  // Helper functions to get today and tomorrow dates
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Filter Events</h3>
      
      <div className="space-y-6">
        {/* Sport Filter */}
        <div>
          <label htmlFor="sport-filter" className="block text-sm font-medium text-gray-700 mb-3">
            Filter by Sport
          </label>
          <select
            id="sport-filter"
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary p-3"
            value={selectedSport || ''}
            onChange={(e) => onSportChange(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Sports</option>
            {sports.map((sport) => (
              <option key={sport.ID} value={sport.ID}>
                {sport.Name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-3">
            Filter by Date
          </label>
          <div className="space-y-3">
            <input
              type="date"
              id="date-filter"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary p-3"
              value={selectedDate || ''}
              onChange={(e) => onDateChange(e.target.value || null)}
            />
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  const todayDate = getTodayDate();
                  onDateChange(selectedDate === todayDate ? null : todayDate);
                }}
                className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                  selectedDate === getTodayDate()
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  const tomorrowDate = getTomorrowDate();
                  onDateChange(selectedDate === tomorrowDate ? null : tomorrowDate);
                }}
                className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                  selectedDate === getTomorrowDate()
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tomorrow
              </button>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              onSportChange(null);
              onDateChange(null);
            }}
            className="w-full px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark hover:bg-primary/5 rounded-md transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFilter;