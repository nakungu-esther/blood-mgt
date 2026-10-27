import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Building2, Users, HeartPulse,
  Droplets, FlaskConical, ClipboardList, Package,
  Truck, ShieldCheck, Activity, BrainCircuit,
  BarChart3, FileText, Bell, Settings, History,
  ArrowLeftRight, LogOut
} from "lucide-react";

const navigation = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Facilities", path: "/facilities", icon: Building2 },
  { label: "Users", path: "/users", icon: Users },
  { label: "Donors", path: "/donors", icon: HeartPulse },
  { label: "Donations", path: "/donations", icon: Droplets },
  { label: "Blood Inventory", path: "/inventory", icon: Package },
  { label: "Laboratory", path: "/laboratory", icon: FlaskConical },
  { label: "Hospital Requests", path: "/hospital-requests", icon: ClipboardList },
  { label: "Stock Matching", path: "/stock-matching", icon: Activity },
  { label: "Blood Transfers", path: "/blood-transfers", icon: Truck },
  { label: "Reservations", path: "/reservations", icon: ShieldCheck },
  { label: "Blood Release", path: "/blood-release", icon: ShieldCheck },
  { label: "Transfusions", path: "/transfusions", icon: HeartPulse },
  { label: "Traceability", path: "/traceability", icon: History },
  { label: "Audit Logs", path: "/audit-logs", icon: FileText },
  { label: "AI Forecasting", path: "/forecasting", icon: BrainCircuit },
  { label: "Redistribution", path: "/redistribution", icon: ArrowLeftRight },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Reports", path: "/reports", icon: FileText },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="bg-[#111d35] text-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 flex flex-col">
        <div className="border-b border-white/10 px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-600 p-3">
              <Droplets size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                AfriBlood
              </h1>
              <p className="text-xs tracking-widest text-slate-400">
                INTELLIGENCE
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-red-600 font-semibold text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-5 text-xs text-slate-400">
          AfriBlood Intelligence
          <p>Prototype • Synthetic data only</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h2 className="font-semibold text-slate-900">
              Blood Supply Intelligence Platform
            </h2>
            <p className="text-xs text-slate-500">
              Vein-to-vein visibility
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Bell size={20} />
            <LogOut size={20} />
          </div>
        </header>

        <main className="p-6 lg:p-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
