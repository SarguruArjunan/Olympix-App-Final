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

export interface Medal {
  ID: number;
  TeamID: number;
  SportID: number;
  Gold: number;
  Silver: number;
  Bronze: number;
  Total: number;
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

export interface Player {
  ID: number;
  FirstName: string;
  LastName: string;
  TeamID: number;
  SportID: number;
  SecondSportID?: number; // Optional second sport
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface TeamWithMedals extends Team {
  medals: {
    Gold: number;
    Silver: number;
    Bronze: number;
    Total: number;
  };
}

// Authentication types
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
} 