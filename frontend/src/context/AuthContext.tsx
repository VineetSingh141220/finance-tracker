'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { setToken, getToken } from '@/lib/api';
import { User } from '@/types';

interface AuthCtx {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // verify token on mount
    useEffect(() => {
        const verify = async () => {
            try {
                // try to refresh first
                const { data: refreshData } = await api.post('/auth/refresh');
                setToken(refreshData.data.accessToken);

                const { data } = await api.get('/auth/me');
                setUser(data.data);
            } catch {
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        verify();
    }, []);

    const login = async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        setToken(data.data.accessToken);
        setUser(data.data.user);
    };

    const register = async (name: string, email: string, password: string) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        setToken(data.data.accessToken);
        setUser(data.data.user);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch { /* ignore */ }
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            accessToken: getToken(),
            isLoading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}
