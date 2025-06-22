import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { Sport, Team, Medal, Event, Player } from '../types';
import apiService from '../services/api';

// Sports hooks
export const useSports = (options?: Partial<UseQueryOptions<Sport[], Error>>) => {
  return useQuery({
    queryKey: ['sports'],
    queryFn: () => apiService.getSports(),
    staleTime: 1000 * 60 * 5, // 5 minutes - reasonable caching
    gcTime: 1000 * 60 * 30, // 30 minutes - reasonable garbage collection
    ...options,
  });
};

export const useSport = (id: number, options?: Partial<UseQueryOptions<Sport, Error>>) => {
  return useQuery({
    queryKey: ['sports', id],
    queryFn: () => apiService.getSport(id),
    enabled: !!id,
    ...options,
  });
};

// Teams hooks
export const useTeams = (options?: Partial<UseQueryOptions<Team[], Error>>) => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => apiService.getTeams(),
    ...options,
  });
};

export const useTeam = (id: number, options?: Partial<UseQueryOptions<Team, Error>>) => {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => apiService.getTeam(id),
    enabled: !!id,
    ...options,
  });
};

// Players hooks
export const usePlayers = (options?: Partial<UseQueryOptions<Player[], Error>>) => {
  return useQuery({
    queryKey: ['players'],
    queryFn: () => apiService.getPlayers(),
    ...options,
  });
};

export const usePlayer = (id: number, options?: Partial<UseQueryOptions<Player, Error>>) => {
  return useQuery({
    queryKey: ['players', id],
    queryFn: () => apiService.getPlayer(id),
    enabled: !!id,
    ...options,
  });
};

// Events hooks
export const useEvents = (options?: Partial<UseQueryOptions<Event[], Error>>) => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => apiService.getEvents(),
    ...options,
  });
};

export const useEvent = (id: number, options?: Partial<UseQueryOptions<Event, Error>>) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => apiService.getEvent(id),
    enabled: !!id,
    ...options,
  });
};

// Medals hooks
export const useMedals = (options?: Partial<UseQueryOptions<Medal[], Error>>) => {
  return useQuery({
    queryKey: ['medals'],
    queryFn: () => apiService.getMedals(),
    ...options,
  });
};

export const useMedal = (id: number, options?: Partial<UseQueryOptions<Medal, Error>>) => {
  return useQuery({
    queryKey: ['medals', id],
    queryFn: () => apiService.getMedal(id),
    enabled: !!id,
    ...options,
  });
};

// Sports mutations
export const useCreateSport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sportData: Omit<Sport, 'ID'>) => apiService.createSport(sportData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    },
  });
};

export const useUpdateSport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Sport, 'ID'>> }) => 
      apiService.updateSport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    },
  });
};

export const useDeleteSport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiService.deleteSport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    },
  });
};

// Team mutations
export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (teamData: Omit<Team, 'ID'>) => apiService.createTeam(teamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Team, 'ID'>> }) => 
      apiService.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

// Player mutations
export const useCreatePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (playerData: Omit<Player, 'ID'>) => apiService.createPlayer(playerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Player, 'ID'>> }) => 
      apiService.updatePlayer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiService.deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
};

// Event mutations
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: Omit<Event, 'ID'>) => apiService.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Event, 'ID'>> }) => 
      apiService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Medal mutations
export const useCreateMedal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (medalData: Omit<Medal, 'ID'>) => apiService.createMedal(medalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medals'] });
    },
  });
};

export const useUpdateMedal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Medal, 'ID'>> }) => 
      apiService.updateMedal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medals'] });
    },
  });
};

export const useDeleteMedal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiService.deleteMedal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medals'] });
    },
  });
}; 