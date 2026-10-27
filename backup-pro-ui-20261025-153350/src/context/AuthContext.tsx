import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
type User = { id: string; email: string; firstName?: string; lastName?: string; role: string; facilityId?: string | null };
type AuthState = { token: string | null; user: User | null };
type AuthContextType = AuthState & { login: (email:string,password:string)=>Promise<void>; logout:()=>void };
const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({children}:{children:ReactNode}) {
  const [state,setState] = useState<AuthState>({token:null,user:null});
  const login = useCallback(async (email:string,password:string) => {
    const data = await api<{accessToken:string;user:User}>('/auth/login',{method:'POST',body:JSON.stringify({email,password})});
    if (!data.accessToken || !data.user) throw new Error('Unexpected login response');
    setState({token:data.accessToken,user:data.user});
  },[]);
  const logout = useCallback(()=>setState({token:null,user:null}),[]);
  return <AuthContext.Provider value={{...state,login,logout}}>{children}</AuthContext.Provider>;
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('AuthProvider missing'); return ctx; }