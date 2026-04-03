import { Permission } from '@/models/permission.entity';
import { User } from '@/models/user.entity';
import { createContext } from 'react';
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
    mainCompany: any | null;
    setMainCompany: (mainCompany: any) => void;
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
    mainCompany: null,
    setMainCompany: (mainCompany) => { },
});

export { AuthContext };

