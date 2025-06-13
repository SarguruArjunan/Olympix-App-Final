import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import IconImage from './IconImage';

interface SportCardProps {
  id: number;
  name: string;
  iconUrl: string;
  description: string;
}

const SportCard: React.FC<SportCardProps> = memo(({ id, name, iconUrl, description }) => {
  return (
    <Link to={`/sports/${id}`}>
      <div className="card transform hover:scale-105 transition-transform duration-200 h-full">
        <div className="flex flex-col items-center p-6">
          <IconImage
            src={iconUrl}
            alt={`Icon for ${name}`}
            className="w-20 h-20 object-contain mb-4"
          />
          <h3 className="text-xl font-heading font-bold text-primary mb-2">
            {name}
          </h3>
          <p className="text-gray-600 text-center line-clamp-3">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
});

SportCard.displayName = 'SportCard';

export default SportCard;