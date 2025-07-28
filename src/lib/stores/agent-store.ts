import { createStore } from "zustand/vanilla";

interface Agent {
  _id: string;
  name: string;
  phoneNumber: string;
  isMain: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  [key: string]: any;
}

type ClientAgent = Omit<
  Agent,
  "isDeleted" | "creaedAt" | "updatedAt" | "deletedAt"
>;

export type AgentState = {
  agent: ClientAgent | null;
};

export type AgentActions = {
  storeAgent: (agent: ClientAgent | null) => void;
  clearAgent: () => void;
  getAgent: () => ClientAgent | null;
};

export type AgentStore = AgentState & AgentActions;

export const initAgentStore = (): AgentState => {
  return { agent: null };
};

export const defaultInitState: AgentState = {
  agent: null,
};

export const createAgentStore = (initState: AgentState = defaultInitState) => {
  return createStore<AgentStore>()((set, get) => ({
    ...initState,
    storeAgent: (agent: ClientAgent | null) => {
      if (agent) {
        set({ agent });
      }
    },
    clearAgent: () => set({ agent: null }),
    getAgent: () => {
      return get()?.agent;
    },
  }));
};
