import { Sport, Team, Medal, Event, Player, ApiResponse } from '../types';
import { API_BASE_URL } from '../constants';

class ApiService {
  private async fetchWithErrorHandling<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }
    
    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || `Failed to fetch ${endpoint}`);
    }
    
    return result.data;
  }

  // Sports API
  async getSports(): Promise<Sport[]> {
    return this.fetchWithErrorHandling<Sport[]>('/sports');
  }

  async getSport(id: number): Promise<Sport> {
    return this.fetchWithErrorHandling<Sport>(`/sports/${id}`);
  }

  async createSport(sportData: Omit<Sport, 'ID'>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sportData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create sport: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create sport');
    }
  }

  async updateSport(id: number, sportData: Partial<Omit<Sport, 'ID'>>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sportData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update sport: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update sport');
    }
  }

  async deleteSport(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sports/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete sport: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete sport');
    }
  }

  // Teams API
  async getTeams(): Promise<Team[]> {
    return this.fetchWithErrorHandling<Team[]>('/teams');
  }

  async getTeam(id: number): Promise<Team> {
    return this.fetchWithErrorHandling<Team>(`/teams/${id}`);
  }

  async createTeam(teamData: Omit<Team, 'ID'>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create team: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create team');
    }
  }

  async updateTeam(id: number, teamData: Partial<Omit<Team, 'ID'>>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update team: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update team');
    }
  }

  async deleteTeam(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete team: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete team');
    }
  }

  // Players API
  async getPlayers(): Promise<Player[]> {
    return this.fetchWithErrorHandling<Player[]>('/players');
  }

  async getPlayer(id: number): Promise<Player> {
    return this.fetchWithErrorHandling<Player>(`/players/${id}`);
  }

  async createPlayer(playerData: Omit<Player, 'ID'>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create player: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create player');
    }
  }

  async updatePlayer(id: number, playerData: Partial<Omit<Player, 'ID'>>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/players/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update player: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update player');
    }
  }

  async deletePlayer(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/players/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete player: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete player');
    }
  }

  // Medals API
  async getMedals(): Promise<Medal[]> {
    return this.fetchWithErrorHandling<Medal[]>('/medals');
  }

  async getMedal(id: number): Promise<Medal> {
    return this.fetchWithErrorHandling<Medal>(`/medals/${id}`);
  }

  async createMedal(medalData: Omit<Medal, 'ID'>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/medals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medalData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create medal: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create medal');
    }
  }

  async updateMedal(id: number, medalData: Partial<Omit<Medal, 'ID'>>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/medals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medalData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update medal: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update medal');
    }
  }

  async deleteMedal(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/medals/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete medal: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete medal');
    }
  }

  // Schedules/Events API
  async getEvents(): Promise<Event[]> {
    return this.fetchWithErrorHandling<Event[]>('/schedules');
  }

  async getEvent(id: number): Promise<Event> {
    return this.fetchWithErrorHandling<Event>(`/schedules/${id}`);
  }

  async createEvent(eventData: Omit<Event, 'ID'>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create event');
    }
  }

  async updateEvent(id: number, eventData: Partial<Omit<Event, 'ID'>>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update event');
    }
  }

  async deleteEvent(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.statusText}`);
    }

    const result: ApiResponse<void> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete event');
    }
  }
}

export const apiService = new ApiService();
export default apiService; 