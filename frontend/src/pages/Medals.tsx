import React from 'react';
import { useTeams, useSports, useMedals } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { findTeamName, findSportName } from '../utils/helpers';

const Medals: React.FC = () => {
  const { data: medals, isLoading: medalsLoading } = useMedals();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: sports, isLoading: sportsLoading } = useSports();

  if (medalsLoading || sportsLoading || teamsLoading) {
    return <LoadingSpinner className="h-[calc(100vh-4rem)]" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Olympic Medals Standings</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Team</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Sport</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Gold</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Silver</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Bronze</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody>
            {medals?.map((medal) => (
              <tr key={medal.ID} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{findTeamName(medal.TeamID, teams || [])}</td>
                <td className="px-6 py-4">{findSportName(medal.SportID, sports || [])}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full">
                    {medal.Gold}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-800 rounded-full">
                    {medal.Silver}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-800 rounded-full">
                    {medal.Bronze}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-semibold">{medal.Total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Medals;