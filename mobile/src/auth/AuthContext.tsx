import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { login as apiLogin, Role } from '../api/client';

const TOKEN_KEY = 'timetracking.token';

interface JwtPayload {
  sub: string;
  role: Role;
  userId: number;
  exp: number;
}

interface AuthState {
  token: string | null;
  email: string | null;
  role: Role | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(globalThis.atob(normalized)) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload): boolean {
  return payload.exp * 1000 <= Date.now();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [payload, setPayload] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(TOKEN_KEY);
      if (stored) {
        const decoded = decodeJwt(stored);
        if (decoded && !isExpired(decoded)) {
          setToken(stored);
          setPayload(decoded);
        } else {
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      }
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    const decoded = decodeJwt(response.token);
    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setPayload(decoded);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setPayload(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      email: payload?.sub ?? null,
      role: payload?.role ?? null,
      loading,
      signIn,
      signOut,
    }),
    [token, payload, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
