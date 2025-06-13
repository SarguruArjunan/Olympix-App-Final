import React from 'react';
import { useTeams } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import TeamCard from '../components/TeamCard';

const Teams: React.FC = () => {
  const { data: teams, isLoading, error } = useTeams();

  if (isLoading) {
    return <LoadingSpinner className="min-h-[400px]" />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Error loading teams"
        message={(error as Error).message}
      />
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <EmptyState
        title="No teams found"
        description="Teams will appear here once they are added to the system."
        icon={
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121L16.5 16M9 9h3m-3 0V6a3 3 0 116 0v3m-3 0v6m0 0v3a3 3 0 01-6 0v-3m0 0h-3m3 0h3" />
          </svg>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-primary mb-8">Teams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team) => (
          <TeamCard
            key={team.ID}
            id={team.ID}
            name={team.Name}
            logoUrl={team.Logo_URL}
            organization={team.Organization}
            tagLine={team.TagLine}
            color={team.Color}
          />
        ))}
      </div>
    </div>
  );
};

export default Teams; 