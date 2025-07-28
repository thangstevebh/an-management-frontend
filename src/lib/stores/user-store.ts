import { createStore } from "zustand/vanilla";

interface User {
  _id: string;
  username: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber: string;
  agentId?: string | null;
  agentRole?: string | null;
  exp?: number;
  iat?: number;
  [key: string]: any; // Allow additional properties
}

type ClientUser = Omit<User, "exp" | "iat">;

export type UserState = {
  user: ClientUser | null;
};

export type UserActions = {
  storeUser: (user: ClientUser | null) => void;
  clearUser: () => void;
};

export type UserStore = UserState & UserActions;

export const initUserStore = (): UserState => {
  return { user: null };
};

export const defaultInitState: UserState = {
  user: null,
};

export const createUserStore = (initState: UserState = defaultInitState) => {
  return createStore<UserStore>()((set) => ({
    ...initState,
    storeUser: (user: ClientUser | null) => {
      if (user) {
        set({ user });
      }
    },
    clearUser: () => set({ user: null }),
  }));
};
