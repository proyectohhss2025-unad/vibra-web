import { Permission } from '@/models/permission.entity';
import { User } from '@/models/user.entity';
import { createContext } from 'react';

// Participante educativo (modelo simplificado para el context)
export interface ParticipantContextData {
    _id: string;
    userId: string;
    nickname: string;
    avatar?: string;
    points: number;
    level: string;
    currentStreak: number;
    maxStreak: number;
    totalActivitiesCompleted: number;
    lastActivityDate?: string;
    currentCourse?: string;
}

// Permisos resueltos desde GET /api/auth/my-permissions
export interface ResolvedPermissions {
    isSuperAdmin: boolean;
    role: { _id: string; name: string } | null;
    permissions: Array<{ _id: string; name: string; serial: string; description?: string }>;
    serials: string[];
}

// Define the interface for the AuthContext value
export interface AuthContextValue {
    token: string | null;
    setToken: (token: string) => void;
    otp: string | null;
    setOtp: (otp: string) => void;
    handleLogin: (newToken: string, newOtp: string) => void;
    handleLogout: () => void;
    user: User | null;
    setUser: (user: User) => void;
    user_: User | null;
    permissions: Permission[] | null;
    resolvedPermissions: ResolvedPermissions | null;
    mainCompany: any | null;
    setMainCompany: (mainCompany: any) => void;
    participant: ParticipantContextData | null;
    setParticipant: (participant: ParticipantContextData | null) => void;
}

// Create the AuthContext with the defined interface
const AuthContext = createContext<AuthContextValue>({
    token: null,
    setToken: (token) => { },
    otp: null,
    setOtp: (otp) => { },
    handleLogin: (newToken, newOtp) => { },
    handleLogout: () => { },
    user: null,
    setUser: (user) => { },
    user_: null,
    permissions: null,
    resolvedPermissions: null,
    mainCompany: null,
    setMainCompany: (mainCompany) => { },
    participant: null,
    setParticipant: (participant) => { },
});

export { AuthContext };

