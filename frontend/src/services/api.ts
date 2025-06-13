import { Sport, Team, Medal, Event, Player, ApiResponse } from '../types';
import { API_BASE_URL } from '../constants';
import { mockSports, mockTeams, mockMedals, mockEvents, mockPlayers } from './mockData';

class ApiService {
  private async fetchWithErrorHandling<T>(endpoint: string): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`Attempting to fetch: ${url}`);
      
      // Create timeout signal for better browser compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || `API Error: Failed to fetch ${endpoint}`);
      }
      
      return result.data;
    } catch (error) {
      // Enhanced error logging for production debugging
      console.error(`API Error for ${endpoint}:`, error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network Error: Unable to connect to API at ${API_BASE_URL}. Please check your connection and try again.`);
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request Timeout: API request to ${endpoint} timed out.`);
      }
      
      throw error;
    }
  }

  // Fallback methods for when API is unavailable
  private async withFallback<T>(
    apiCall: () => Promise<T>,
    fallbackData: T,
    context: string
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      console.warn(`${context}: API unavailable, using fallback data`, error);
      
      // Show a user-friendly notification that we're using demo data
      if (process.env.NODE_ENV === 'production') {
        console.info('📊 Using demo data - API is currently unavailable');
      }
      
      return fallbackData;
    }
  }

  // Sports API
  async getSports(): Promise<Sport[]> {
    return this.withFallback(
      () => this.fetchWithErrorHandling<Sport[]>('/sports'),
      mockSports,
      'getSports'
    );
  }

  async getSport(id: number): Promise<Sport> {
    return this.withFallback(
      () => this.fetchWithErrorHandling<Sport>(`/sports/${id}`),
      mockSports.find(s => s.ID === id) || mockSports[0],
      'getSport'
    );
  }

  async createSport(sportData: Omit<Sport, 'ID'>): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/sports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sportData),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to create sport: ${response.statusText}`);
      }

      const result: ApiResponse<void> = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create sport');
      }
    } catch (error) {
      console.error('Create sport error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network Error: Unable to connect to API. Please check your connection.`);
      }
      throw error;
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
    return this.withFallback(
      () => this.fetchWithErrorHandling<Team[]>('/teams'),
      mockTeams,
      'getTeams'
    );
  }

  async getTeam(id: number): Promise<Team> {
    return this.withFallback(
      () => this.fetchWithErrorHandling<Team>(`/teams/${id}`),
      mockTeams.find(t => t.ID === id) || mockTeams[0],
      'getTeam'
    );
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
    return this.withFallback(
      () => this.fetchWithErrorHandling<Player[]>('/players'),
      mockPlayers,
      'getPlayers'
    );
  }

  async getPlayer(id: number): Promise<Player> {
    return this.withFallback(
      () => this.fetchWithErrorHandling<Player>(`/players/${id}`),
      mockPlayers.find(p => p.ID === id) || mockPlayers[0],
      'getPlayer'
    );
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
    return this.withFallback(
      () => this.fetchWithErrorHandling<Medal[]>('/medals'),
      mockMedals,
      'getMedals'
    );
  }

  async getMedal(id: number): Promise<Medal> {
    return this.withFallback(
      () => this.fetchWithErrorHandling<Medal>(`/medals/${id}`),
      mockMedals.find(m => m.ID === id) || mockMedals[0],
      'getMedal'
    );
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
    return this.withFallback(
      () => this.fetchWithErrorHandling<Event[]>('/schedules'),
      mockEvents,
      'getEvents'
    );
  }

  async getEvent(id: number): Promise<Event> {
    return this.withFallback(
      () => this.fetchWithErrorHandling<Event>(`/schedules/${id}`),
      mockEvents.find(e => e.ID === id) || mockEvents[0],
      'getEvent'
    );
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