import { create } from 'zustand';
import { AgentStatus, AgentGroup, Skill, Schedule } from '../types';
import { Agent } from '../types/agent';

interface AgentState {
  agents: Agent[];
  groups: AgentGroup[];
  skills: Skill[];
  schedules: Schedule[];
  selectedAgent: Agent | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  setAgentStatus: (id: string, status: AgentStatus) => void;
  selectAgent: (agent: Agent | null) => void;
  
  // Groups
  setGroups: (groups: AgentGroup[]) => void;
  addGroup: (group: AgentGroup) => void;
  updateGroup: (id: string, updates: Partial<AgentGroup>) => void;
  removeGroup: (id: string) => void;
  
  // Skills
  setSkills: (skills: Skill[]) => void;
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  
  // Schedules
  setSchedules: (schedules: Schedule[]) => void;
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  removeSchedule: (id: string) => void;
  
  // Utilities
  getOnlineAgents: () => Agent[];
  getAgentsByGroup: (groupId: string) => Agent[];
  getAgentsBySkill: (skillId: string) => Agent[];
  getAvailableAgents: () => Agent[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  groups: [],
  skills: [],
  schedules: [],
  selectedAgent: null,
  loading: false,
  error: null,

  setAgents: (agents) => set({ agents }),
  
  addAgent: (agent) => set((state) => ({
    agents: [...state.agents, agent]
  })),
  
  updateAgent: (id, updates) => set((state) => ({
    agents: state.agents.map(agent => 
      agent.id === id ? { ...agent, ...updates } : agent
    )
  })),
  
  removeAgent: (id) => set((state) => ({
    agents: state.agents.filter(agent => agent.id !== id)
  })),
  
  setAgentStatus: (id, status) => set((state) => ({
    agents: state.agents.map(agent => 
      agent.id === id 
        ? { 
            ...agent, 
            status, 
            lastActiveAt: new Date(),
            isOnline: status === AgentStatus.ONLINE || status === AgentStatus.BUSY
          } 
        : agent
    )
  })),
  
  selectAgent: (agent) => set({ selectedAgent: agent }),
  
  setGroups: (groups) => set({ groups }),
  
  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group]
  })),
  
  updateGroup: (id, updates) => set((state) => ({
    groups: state.groups.map(group => 
      group.id === id ? { ...group, ...updates } : group
    )
  })),
  
  removeGroup: (id) => set((state) => ({
    groups: state.groups.filter(group => group.id !== id)
  })),
  
  setSkills: (skills) => set({ skills }),
  
  addSkill: (skill) => set((state) => ({
    skills: [...state.skills, skill]
  })),
  
  updateSkill: (id, updates) => set((state) => ({
    skills: state.skills.map(skill => 
      skill.id === id ? { ...skill, ...updates } : skill
    )
  })),
  
  removeSkill: (id) => set((state) => ({
    skills: state.skills.filter(skill => skill.id !== id)
  })),
  
  setSchedules: (schedules) => set({ schedules }),
  
  addSchedule: (schedule) => set((state) => ({
    schedules: [...state.schedules, schedule]
  })),
  
  updateSchedule: (id, updates) => set((state) => ({
    schedules: state.schedules.map(schedule => 
      schedule.id === id ? { ...schedule, ...updates } : schedule
    )
  })),
  
  removeSchedule: (id) => set((state) => ({
    schedules: state.schedules.filter(schedule => schedule.id !== id)
  })),
  
  getOnlineAgents: () => {
    const { agents } = get();
    return agents.filter(agent => agent.isOnline);
  },
  
  getAgentsByGroup: (groupId) => {
    const { agents } = get();
    return agents.filter(agent => 
      agent.groups.some(group => group.id === groupId)
    );
  },
  
  getAgentsBySkill: (skillId) => {
    const { agents } = get();
    return agents.filter(agent => 
      agent.skills.some(skill => skill.id === skillId)
    );
  },
  
  getAvailableAgents: () => {
    const { agents } = get();
    return agents.filter(agent => 
      agent.status === AgentStatus.ONLINE && 
      agent.currentSessions < agent.maxSessions
    );
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));