import { Team, Sport } from '../types';
import { DATE_FORMAT_OPTIONS, TIME_FORMAT_OPTIONS } from '../constants';

export const findTeamName = (teamId: number, teams: Team[] = []): string => {
  const team = teams.find(t => t.ID === teamId);
  return team?.Name || 'Unknown Team';
};

export const findSportName = (sportId: number, sports: Sport[] = []): string => {
  const sport = sports.find(s => s.ID === sportId);
  return sport?.Name || 'Unknown Sport';
};

export const findTeam = (teamId: number, teams: Team[] = []): Team | undefined => {
  return teams.find(t => t.ID === teamId);
};

export const findSport = (sportId: number, sports: Sport[] = []): Sport | undefined => {
  return sports.find(s => s.ID === sportId);
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
};

export const formatTime = (timeStr: string): string => {
  return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString('en-US', TIME_FORMAT_OPTIONS);
};

export const getTeamInitials = (teamName: string): string => {
  return teamName
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
}; 