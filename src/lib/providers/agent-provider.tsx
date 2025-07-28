"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import {
  type AgentStore,
  createAgentStore,
  initAgentStore,
} from "../stores/agent-store";

export type AgentStoreApi = ReturnType<typeof createAgentStore>;

export const AgentStoreContext = createContext<AgentStoreApi | undefined>(
  undefined,
);

export interface AgentStoreProviderProps {
  children: ReactNode;
}

export const AgentStoreProvider = ({ children }: AgentStoreProviderProps) => {
  const storeRef = useRef<AgentStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createAgentStore(initAgentStore());
  }

  return (
    <AgentStoreContext.Provider value={storeRef.current}>
      {children}
    </AgentStoreContext.Provider>
  );
};

export const useAgentStore = <T,>(selector: (store: AgentStore) => T): T => {
  const agentStoreContext = useContext(AgentStoreContext);

  if (!agentStoreContext) {
    throw new Error(`useCounterStore must be used within CounterStoreProvider`);
  }

  return useStore(agentStoreContext, selector);
};
