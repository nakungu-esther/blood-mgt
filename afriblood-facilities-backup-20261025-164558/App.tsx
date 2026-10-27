import UsersPage from './pages/UsersPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ResourcePage from './components/ResourcePage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SystemStatus from './pages/SystemStatus';
import { modules } from './lib/modules';
function AppRoutes(){const {token}=useAuth();return <BrowserRouter><Routes>{!token?<><Route path="/login" element={<Login/>}/><Route path="*" element={<Navigate to="/login" replace/>}/></>:<><Route element={<Layout/>}><Route index element={<Dashboard/>}/>{modules.filter(m=>m.path!=='/'&&m.path!=='/health'&&m.path!=='/users').map(m=><Route key={m.path} path={m.path.slice(1)} element={<ResourcePage module={m}/>}/>) }<Route path="users" element={<UsersPage/>}/><Route path="health" element={<SystemStatus/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></>}</Routes></BrowserRouter>}
export default function App(){return <AuthProvider><AppRoutes/></AuthProvider>}
