import { Sport, Team, Medal, Event, Player } from '../types';

// Mock data for when API is unavailable
export const mockSports: Sport[] = [
  {
    ID: 1,
    Name: "Foosball",
    Description: "Table soccer played with rods and miniature players, requiring quick reflexes and strategic play.",
    Icon_URL: "/Icons/foosball.svg"
  },
  {
    ID: 2,
    Name: "Carrom",
    Description: "Fast-paced tabletop game where players flick discs into pockets, combining skill and strategy.",
    Icon_URL: "/Icons/carrom.svg"
  },
  {
    ID: 3,
    Name: "Chess",
    Description: "Classic strategic board game of kings and queens, testing players' tactical thinking.",
    Icon_URL: "/Icons/chess.svg"
  },
  {
    ID: 4,
    Name: "Table Tennis",
    Description: "Fast-paced racket sport played on a table, demanding quick reflexes and precision.",
    Icon_URL: "/Icons/table-tennis.svg"
  },
  {
    ID: 5,
    Name: "Badminton",
    Description: "High-energy racket sport played with a shuttlecock, requiring agility and tactical play.",
    Icon_URL: "/Icons/badminton.svg"
  },
  {
    ID: 6,
    Name: "Cricket",
    Description: "Team sport played with bat and ball, combining individual skill with team strategy.",
    Icon_URL: "/Icons/cricket.svg"
  },
  {
    ID: 7,
    Name: "Football",
    Description: "The beautiful game played between two teams of eleven players each.",
    Icon_URL: "/Icons/football.svg"
  },
  {
    ID: 8,
    Name: "Basketball",
    Description: "Fast-paced team sport played with a ball and hoop, requiring coordination and teamwork.",
    Icon_URL: "/Icons/basketball.svg"
  },
  {
    ID: 9,
    Name: "Lemon Spoon Race",
    Description: "Fun relay race where participants balance a lemon on a spoon while running.",
    Icon_URL: "/Icons/lemon-spoon.svg"
  }
];

export const mockTeams: Team[] = [
  {
    ID: 1,
    Name: "Success Squad",
    Country: "USA",
    Logo_URL: "/images/teams/success-squad.png",
    Organization: "Enablement & Success",
    TagLine: "Game On,CustGrSnss",
    Color: "#000000"
  },
  {
    ID: 2,
    Name: "BkNdBoss",
    Country: "India",
    Logo_URL: "/images/teams/bkndboss.png",
    Organization: "G&A",
    TagLine: "Game On,BkNd Strong!",
    Color: "#8B4513"
  },
  {
    ID: 3,
    Name: "Olympus",
    Country: "USA",
    Logo_URL: "/images/teams/olympus.png",
    Organization: "Hosting & Security",
    TagLine: "Power of Gods",
    Color: "#800080"
  },
  {
    ID: 4,
    Name: "ClassIX",
    Country: "Canada",
    Logo_URL: "/images/teams/classix.png",
    Organization: "Classroom",
    TagLine: "Raw Skill, Pure Class",
    Color: "#FF8C00"
  },
  {
    ID: 5,
    Name: "KRR",
    Country: "UK",
    Logo_URL: "/images/teams/krr.png",
    Organization: "Compliance",
    TagLine: "Rise Rally Reign",
    Color: "#808080"
  },
  {
    ID: 6,
    Name: "CoreForce",
    Country: "Australia",
    Logo_URL: "/images/teams/coreforce.png",
    Organization: "PS SIS+",
    TagLine: "Unleash Our Core Power",
    Color: "#FF0000"
  },
  {
    ID: 7,
    Name: "PhoenIX",
    Country: "India",
    Logo_URL: "/images/teams/phoenix.png",
    Organization: "UI&DS",
    TagLine: "Honor, Fire, Victory",
    Color: "#008000"
  },
  {
    ID: 8,
    Name: "NUM1",
    Country: "USA",
    Logo_URL: "/images/teams/num1.png",
    Organization: "UT&CCLR",
    TagLine: "United for Success",
    Color: "#00CED1"
  },
  {
    ID: 9,
    Name: "ERP Blaze",
    Country: "Germany",
    Logo_URL: "/images/teams/erp-blaze.png",
    Organization: "ERP & HED R&D",
    TagLine: "Elevate Radiate Power",
    Color: "#000080"
  },
  {
    ID: 10,
    Name: "On Point",
    Country: "India",
    Logo_URL: "/images/teams/on-point.png",
    Organization: "Services",
    TagLine: "Swift Sharp Strong",
    Color: "#FFFF00"
  },
  {
    ID: 11,
    Name: "Warriors",
    Country: "USA",
    Logo_URL: "/images/teams/warriors.png",
    Organization: "Support 1",
    TagLine: "Built to Battle",
    Color: "#FF69B4"
  },
  {
    ID: 12,
    Name: "Knights",
    Country: "Canada",
    Logo_URL: "/images/teams/knights.png",
    Organization: "Support 2",
    TagLine: "Lead with Power",
    Color: "#008B8B"
  }
];

export const mockMedals: Medal[] = [
  {
    ID: 2,
    TeamID: 1,
    SportID: 3,
    Gold: 1,
    Silver: 0,
    Bronze: 1,
    Total: 2
  },
  {
    ID: 3,
    TeamID: 1,
    SportID: 4,
    Gold: 0,
    Silver: 2,
    Bronze: 1,
    Total: 3
  },
  {
    ID: 4,
    TeamID: 2,
    SportID: 2,
    Gold: 1,
    Silver: 1,
    Bronze: 1,
    Total: 3
  },
  {
    ID: 5,
    TeamID: 2,
    SportID: 5,
    Gold: 2,
    Silver: 0,
    Bronze: 0,
    Total: 2
  },
  {
    ID: 6,
    TeamID: 2,
    SportID: 7,
    Gold: 1,
    Silver: 1,
    Bronze: 0,
    Total: 2
  },
  {
    ID: 7,
    TeamID: 3,
    SportID: 6,
    Gold: 0,
    Silver: 1,
    Bronze: 2,
    Total: 3
  },
  {
    ID: 8,
    TeamID: 3,
    SportID: 8,
    Gold: 1,
    Silver: 0,
    Bronze: 1,
    Total: 2
  },
  {
    ID: 9,
    TeamID: 3,
    SportID: 9,
    Gold: 0,
    Silver: 1,
    Bronze: 0,
    Total: 1
  },
  {
    ID: 10,
    TeamID: 4,
    SportID: 9,
    Gold: 2,
    Silver: 1,
    Bronze: 1,
    Total: 4
  }
];

export const mockEvents: Event[] = [
  {
    ID: 1,
    SportID: 1,
    Name: "Foosball Tournament - Round 1",
    Date: "2025-07-01",
    Time: "10:00:00",
    Location: "Game Room A",
    Status: "Completed"
  },
  {
    ID: 2,
    SportID: 2,
    Name: "Carrom Championship",
    Date: "2025-07-01",
    Time: "14:00:00",
    Location: "Indoor Arena",
    Status: "Completed"
  },
  {
    ID: 3,
    SportID: 3,
    Name: "Chess Masters Series",
    Date: "2025-07-02",
    Time: "09:00:00",
    Location: "Strategy Hall",
    Status: "In Progress"
  },
  {
    ID: 4,
    SportID: 4,
    Name: "Table Tennis Singles",
    Date: "2025-07-02",
    Time: "13:00:00",
    Location: "Sports Complex B",
    Status: "Scheduled"
  },
  {
    ID: 5,
    SportID: 5,
    Name: "Badminton Mixed Doubles",
    Date: "2025-07-03",
    Time: "11:00:00",
    Location: "Court 1",
    Status: "Scheduled"
  },
  {
    ID: 6,
    SportID: 6,
    Name: "Cricket T20 Match",
    Date: "2025-07-03",
    Time: "15:00:00",
    Location: "Main Ground",
    Status: "Scheduled"
  },
  {
    ID: 7,
    SportID: 1,
    Name: "Test Event",
    Date: "2025-07-01",
    Time: "10:00:00",
    Location: "Test Location",
    Status: "Scheduled"
  },
  {
    ID: 8,
    SportID: 4,
    Name: "Table tenning",
    Date: "2025-06-25",
    Time: "17:49",
    Location: "Recreation Area",
    Status: "Scheduled"
  },
  {
    ID: 9,
    SportID: 3,
    Name: "Test Environment Separation",
    Date: "2025-07-01",
    Time: "15:30",
    Location: "Testing Arena",
    Status: "Scheduled"
  },
  {
    ID: 10,
    SportID: 3,
    Name: "Test Environment Separation",
    Date: "2025-07-01",
    Time: "15:30",
    Location: "Testing Arena",
    Status: "Scheduled"
  },
  {
    ID: 11,
    SportID: 2,
    Name: "Testing JSON File Production Storage",
    Date: "2025-07-05",
    Time: "14:00",
    Location: "Production Test Arena",
    Status: "Scheduled"
  }
];

export const mockPlayers: Player[] = [
  {
    ID: 1,
    FirstName: "John",
    LastName: "Smith",
    TeamID: 4,
    SportID: 3
  },
  {
    ID: 2,
    FirstName: "Sarah",
    LastName: "Johnson",
    TeamID: 1,
    SportID: 3
  },
  {
    ID: 3,
    FirstName: "Mike",
    LastName: "Chen",
    TeamID: 2,
    SportID: 2
  },
  {
    ID: 4,
    FirstName: "Emily",
    LastName: "Davis",
    TeamID: 2,
    SportID: 5
  },
  {
    ID: 5,
    FirstName: "Alex",
    LastName: "Wilson",
    TeamID: 3,
    SportID: 6
  },
  {
    ID: 6,
    FirstName: "Lisa",
    LastName: "Brown",
    TeamID: 3,
    SportID: 8
  },
  {
    ID: 8,
    FirstName: "Anna",
    LastName: "Garcia",
    TeamID: 4,
    SportID: 7
  },
  {
    ID: 9,
    FirstName: "Tom",
    LastName: "Anderson",
    TeamID: 5,
    SportID: 9
  },
  {
    ID: 10,
    FirstName: "Jessica",
    LastName: "Taylor",
    TeamID: 5,
    SportID: 1
  },
  {
    ID: 11,
    FirstName: "Sarguru",
    LastName: "A",
    TeamID: 4,
    SportID: 2
  },
  {
    ID: 12,
    FirstName: "Test",
    LastName: "a",
    TeamID: 4,
    SportID: 9
  },
  {
    ID: 13,
    FirstName: "Test B",
    LastName: "B",
    TeamID: 4,
    SportID: 9
  }
];