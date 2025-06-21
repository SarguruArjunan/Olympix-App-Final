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
  },
  {
    ID: 4,
    Name: "Badminton",
    Description: "Racquet sport with shuttlecock",
    Icon_URL: "/Icons/badminton.svg"
  },
  {
    ID: 5,
    Name: "Table Tennis",
    Description: "Indoor racquet sport",
    Icon_URL: "/Icons/table-tennis.svg"
  },
  {
    ID: 6,
    Name: "Football",
    Description: "Most popular sport worldwide",
    Icon_URL: "/Icons/football.svg"
  },
  {
    ID: 7,
    Name: "Carrom",
    Description: "Traditional board game",
    Icon_URL: "/Icons/carrom.svg"
  },
  {
    ID: 8,
    Name: "Foosball",
    Description: "Table football game",
    Icon_URL: "/Icons/foosball.svg"
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
  },
  {
    ID: 3,
    Name: "Fire Hawks",
    Country: "India",
    Logo_URL: "/images/teams/fire-hawks.png",
    Organization: "PowerSchool",
    TagLine: "Soaring to Victory",
    Color: "#FF9F43"
  },
  {
    ID: 4,
    Name: "Ocean Warriors",
    Country: "India",
    Logo_URL: "/images/teams/ocean-warriors.png",
    Organization: "PowerSchool",
    TagLine: "Riding the Waves",
    Color: "#3742FA"
  },
  {
    ID: 5,
    Name: "Green Guardians",
    Country: "India",
    Logo_URL: "/images/teams/green-guardians.png",
    Organization: "PowerSchool",
    TagLine: "Protecting Our Future",
    Color: "#2ED573"
  },
  {
    ID: 6,
    Name: "Golden Eagles",
    Country: "India",
    Logo_URL: "/images/teams/golden-eagles.png",
    Organization: "PowerSchool",
    TagLine: "Flying High",
    Color: "#FFA726"
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