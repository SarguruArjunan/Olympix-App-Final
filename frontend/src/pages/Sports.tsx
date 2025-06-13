import React from 'react';
import { useSports } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SportCard from '../components/SportCard';

const Sports: React.FC = () => {
  const { data: sports, isLoading, error } = useSports();

  if (isLoading) {
    return <LoadingSpinner className="min-h-[400px]" />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Error loading sports"
        message={(error as Error).message}
      />
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-primary mb-8">Sports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sports?.map((sport) => (
          <SportCard
            key={sport.ID}
            id={sport.ID}
            name={sport.Name}
            iconUrl={sport.Icon_URL}
            description={sport.Description}
          />
        ))}
      </div>
    </div>
  );
};

export default Sports;