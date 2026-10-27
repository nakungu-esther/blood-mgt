import Reports from './pages/Reports';
import Traceability from './pages/Traceability';
import BloodRelease from './pages/BloodRelease';
import BloodReservations from './pages/BloodReservations';
import StockMatching from './pages/StockMatching';
import BloodTransfers from './pages/BloodTransfers';
import HospitalRequests from './pages/HospitalRequests';
import Donors from './pages/Donors';
import Donations from './pages/Donations';
import Laboratory from './pages/Laboratory';
import InventoryPage from './pages/InventoryPage';
import FacilitiesPage from './pages/FacilitiesPage';
import UsersPage from './pages/UsersPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ResourcePage from './components/ResourcePage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SystemStatus from './pages/SystemStatus';
import { modules } from './lib/modules';
function AppRoutes(){const {token}=useAuth();return <BrowserRouter><Routes>{!token?<><Route path="/login" element={<Login/>}/><Route path="*" element={<Navigate to="/login" replace/>}/></>:<><Route element={<Layout/>}><Route index element={<Dashboard/>}/>{modules.filter(m=>m.path!=='/'&&m.path!=='/health'&&m.path!=='/facilities'&&m.path!=='/users').map(m=><Route key={m.path} path={m.path.slice(1)} element={m.path==='/inventory'?<InventoryPage/>:m.path==='/donors'?<Donors/>:m.path==='/donations'?<Donations/>:m.path==='/laboratory'?<Laboratory/>:m.path==='/hospital-requests'?<HospitalRequests/>:m.path==='/blood-transfers'?<BloodTransfers/>:m.path==='/stock-matching'?<StockMatching/>:m.path==='/blood-reservations'?<BloodReservations/>:m.path==='/blood-release'?<BloodRelease/>:m.path==='/traceability'?<Traceability/>:m.path==='/reports'?<Reports/>:<ResourcePage module={m}/>}/>) }<Route path="users" element={<UsersPage/>}/><Route path="facilities" element={<FacilitiesPage/>}/><Route path="health" element={<SystemStatus/>}/></Route><Route path="*" element={<Navigate to="/" replace/>}/></>}</Routes></BrowserRouter>}
export default function App(){return <AuthProvider><AppRoutes/></AuthProvider>}




