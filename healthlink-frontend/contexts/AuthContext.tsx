'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { LoginRequest, LoginResponse, RegisterClientRequest, RegisterExpertRequest, UserInfo } from '@/types/auth';

interface AuthContextType {
    user: UserInfo | null;
    isLoading: boolean;
    login: (credentials: LoginRequest, redirectTo?: string) => Promise<void>;
    registerClient: (data: RegisterClientRequest) => Promise<void>;
    registerExpert: (data: RegisterExpertRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Check if a JWT token is expired
    const isTokenExpired = (token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // Convert to ms
            return Date.now() >= exp;
        } catch {
            return true; // If we can't parse it, treat as expired
        }
    };

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            // Validate token expiry
            if (isTokenExpired(token)) {
                console.log('Token expired, clearing session');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
            } else {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (error) {
                    console.error('Failed to parse user data:', error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                }
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest, redirectTo?: string) => {
        try {
            const response = await api.post<LoginResponse>('/api/auth/login', credentials);
            const { accessToken, user: userData } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            // If redirectTo is provided, use that
            if (redirectTo) {
                router.push(redirectTo);
                return;
            }

            // Default: Redirect based on role
            if (userData.roles.includes('Admin')) {
                router.push('/admin/dashboard');
            } else if (userData.roles.includes('Expert')) {
                router.push('/expert/dashboard');
            } else if (userData.roles.includes('Client')) {
                router.push('/');
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const registerClient = async (data: RegisterClientRequest) => {
        try {
            const response = await api.post<LoginResponse>('/api/auth/register-client', data);
            const { accessToken, user: userData } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            router.push('/client/dashboard');
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const registerExpert = async (data: RegisterExpertRequest) => {
        try {
            const response = await api.post<LoginResponse>('/api/auth/register-expert', data);
            const { accessToken, user: userData } = response.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            router.push('/expert/dashboard');
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    const hasRole = (role: string): boolean => {
        return user?.roles.includes(role) ?? false;
    };

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        registerClient,
        registerExpert,
        logout,
        isAuthenticated: !!user,
        hasRole,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
