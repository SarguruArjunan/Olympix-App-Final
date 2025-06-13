import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { getTeamInitials } from '../utils/helpers';

interface TeamCardProps {
  id: number;
  name: string;
  logoUrl: string;
  organization: string;
  tagLine: string;
  color: string;
}

const TeamCard: React.FC<TeamCardProps> = memo(({ 
  id, 
  name, 
  logoUrl, 
  organization, 
  tagLine, 
  color
}) => {
  
  return (
    <Link to={`/teams/${id}`} className="block">
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2"
              style={{ borderColor: color }}
            >
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl" style="background-color: ${color}">${getTeamInitials(name)}</div>`;
                    }
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: color }}
                >
                  {getTeamInitials(name)}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-gray-800">{name}</h3>
            
            <p className="text-gray-700 italic">
              "{tagLine}"
            </p>
            
            <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
              {organization}
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-sm text-gray-500">Team #{id}</span>
              <div 
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: color }}
                title={`Team color: ${color}`}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

TeamCard.displayName = 'TeamCard';

export default TeamCard; 