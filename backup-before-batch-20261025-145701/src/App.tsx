import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Facilities from "./pages/Facilities";
import Users from "./pages/Users";
import Donors from "./pages/Donors";
import Donations from "./pages/Donations";
import BloodInventory from "./pages/BloodInventory";
import Laboratory from "./pages/Laboratory";
import HospitalRequests from "./pages/HospitalRequests";
import StockMatching from "./pages/StockMatching";
import BloodTransfers from "./pages/BloodTransfers";
import BloodReservations from "./pages/BloodReservations";
import BloodRelease from "./pages/BloodRelease";
import Transfusions from "./pages/Transfusions";
import Traceability from "./pages/Traceability";
import AuditLogs from "./pages/AuditLogs";
import DemandForecasting from "./pages/DemandForecasting";
import Redistribution from "./pages/Redistribution";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="facilities" element={<Facilities />} />
          <Route path="users" element={<Users />} />
          <Route path="donors" element={<Donors />} />
          <Route path="donations" element={<Donations />} />
          <Route path="inventory" element={<BloodInventory />} />
          <Route path="laboratory" element={<Laboratory />} />
          <Route path="hospital-requests" element={<HospitalRequests />} />
          <Route path="stock-matching" element={<StockMatching />} />
          <Route path="blood-transfers" element={<BloodTransfers />} />
          <Route path="reservations" element={<BloodReservations />} />
          <Route path="blood-release" element={<BloodRelease />} />
          <Route path="transfusions" element={<Transfusions />} />
          <Route path="traceability" element={<Traceability />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="forecasting" element={<DemandForecasting />} />
          <Route path="redistribution" element={<Redistribution />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
