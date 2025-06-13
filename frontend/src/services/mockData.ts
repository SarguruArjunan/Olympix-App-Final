import { Sport, Team, Medal, Event, Player } from '../types';

// Mock data for when API is unavailable
export const mockSports: Sport[] = [
  {
    ID: 1,
    Name: "Basketball",
    Description: "Fast-paced team sport",
    Icon_URL: "/Icons/basketball.svg"
  },
  {
    ID: 2,
    Name: "Cricket",
    Description: "Popular bat-and-ball game",
    Icon_URL: "/Icons/cricket.svg"
  },
  {
    ID: 3,
    Name: "Chess",
    Description: "Strategic board game",
    Icon_URL: "/Icons/chess.svg"
  }
];

export const mockTeams: Team[] = [
  {
    ID: 1,
    Name: "Classix Champions",
    Country: "India",
    Logo_URL: "/images/teams/classix.png",
    Organization: "PowerSchool",
    TagLine: "Excellence in Competition",
    Color: "#FF6B6B"
  },
  {
    ID: 2,
    Name: "Thunder Bolts",
    Country: "India",
    Logo_URL: "/images/teams/thunder.png",
    Organization: "PowerSchool",
    TagLine: "Strike Like Lightning",
    Color: "#4ECDC4"
  }
];

export const mockMedals: Medal[] = [
  {
    ID: 1,
    TeamID: 1,
    SportID: 1,
    Gold: 2,
    Silver: 1,
    Bronze: 0,
    Total: 3
  },
  {
    ID: 2,
    TeamID: 2,
    SportID: 2,
    Gold: 1,
    Silver: 2,
    Bronze: 1,
    Total: 4
  }
];

export const mockEvents: Event[] = [
  {
    ID: 1,
    SportID: 1,
    Name: "Basketball Finals",
    Date: "2024-02-01",
    Time: "14:00",
    Location: "Main Court",
    Status: "Scheduled"
  },
  {
    ID: 2,
    SportID: 2,
    Name: "Cricket Semi-Final",
    Date: "2024-02-02",
    Time: "10:00",
    Location: "Cricket Ground",
    Status: "Scheduled"
  }
];

export const mockPlayers: Player[] = [
  {
    ID: 1,
    FirstName: "John",
    LastName: "Smith",
    TeamID: 1,
    SportID: 1
  },
  {
    ID: 2,
    FirstName: "Sarah",
    LastName: "Wilson",
    TeamID: 2,
    SportID: 2
  }
];