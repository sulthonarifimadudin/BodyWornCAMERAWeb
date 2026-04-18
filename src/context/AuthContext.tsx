import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
    id: number;
    email: string;
    phone: string;
    full_name: string;
    position: string;
    location: string;
    role: string;
    avatar?: string | null;
    profile_image?: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const login = (token: string, userData: User) => {
        localStorage.setItem("jwtToken", token);
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = async () => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            try {
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Gagal call backend logout:", error);
            }
        }
        localStorage.removeItem("jwtToken");
        setUser(null);
        setIsLoggedIn(false);
    };

    const fetchUser = async () => {
        setLoading(true);
        const token = localStorage.getItem("jwtToken");
        
        if (!token) {
            setIsLoggedIn(false);
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setUser(data.user);
                setIsLoggedIn(true);
            } else {
                // Token invalid or expired
                logout();
            }
        } catch (error) {
            console.error("Gagal mengambil data user:", error);
            setIsLoggedIn(false);
        } finally {
            setLoading(false);
        }
    };

    // Load user on first mount
    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
