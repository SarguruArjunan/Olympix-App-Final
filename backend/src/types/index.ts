export interface Sport {
  ID: number;
  Name: string;
  Icon_URL: string;
  Description: string;
}

export interface Team {
  ID: number;
  Name: string;
  Country: string;
  Logo_URL: string;
  Organization: string;
  TagLine: string;
  Color: string;
}

export interface Player {
  ID: number;
  FirstName: string;
  LastName: string;
  TeamID: number;
  SportID: number;
  SecondSportID?: number; // Optional second sport
}

export interface Event {
  ID: number;
  SportID: number;
  Name: string;
  Date: string;
  Time: string;
  Location: string;
  TeamA_ID?: number;
  TeamB_ID?: number;
  Status?: 'Scheduled' | 'In Progress' | 'Completed';
  WinnerTeamID?: number;
  TeamA_Score?: string;
  TeamB_Score?: string;
  ResultNotes?: string;
}

export interface Match {
  ID: number;
  EventID: number;
  ParticipantA_ID: number;
  ParticipantB_ID: number;
  ScoreA: string | number;
  ScoreB: string | number;
  WinnerID: number;
  Status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface Medal {
  ID: number;
  TeamID: number;
  SportID: number;
  Gold: number;
  Silver: number;
  Bronze: number;
  Total: number;
}

export type SheetName = 'Sports' | 'Teams' | 'Players' | 'Events' | 'Matches' | 'Medals';

export type SheetData = Sport | Team | Player | Event | Match | Medal;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}