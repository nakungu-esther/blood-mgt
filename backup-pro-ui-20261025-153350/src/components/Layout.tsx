import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Droplets, Menu, X, LogOut, Bell, ShieldAlert } from 'lucide-react';
import { modules } from '../lib/modules';
import { useAuth } from '../context/AuthContext';
export default function Layout(){
  const {user,logout}=useAuth(); const [open,setOpen]=useState(false);
  const visible=modules.filter(m=>!m.roles||m.roles.includes(user?.role||''));
  return <div className="min-h-screen bg-[#f6f7fb] lg:flex">
    {open && <button aria-label="Close navigation" onClick={()=>setOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden"/>}
    <aside className={`${open?'translate-x-0':'-translate-x-full'} fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#111d35] text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0`}>
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6"><div className="rounded-xl bg-red-600 p-3"><Droplets/></div><div className="flex-1"><div className="text-xl font-extrabold">AfriBlood</div><div className="text-xs tracking-widest text-slate-400">INTELLIGENCE</div></div><button className="lg:hidden" onClick={()=>setOpen(false)} aria-label="Close menu"><X/></button></div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">{visible.map(({path,title,icon:Icon})=><NavLink onClick={()=>setOpen(false)} key={path} to={path} end={path==='/'} className={({isActive})=>`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm ${isActive?'bg-red-600 font-semibold text-white':'text-slate-300 hover:bg-white/10'}`}><Icon size={18}/>{title}</NavLink>)}</nav>
      <div className="border-t border-white/10 p-4 text-xs text-slate-400">Synthetic-data prototype · Not for clinical use</div>
    </aside>
    <div className="min-w-0 flex-1"><header className="flex h-20 items-center justify-between border-b bg-white px-5 lg:px-8"><div className="flex items-center gap-3"><button className="lg:hidden" onClick={()=>setOpen(true)} aria-label="Open menu"><Menu/></button><div><p className="font-semibold text-slate-900">Blood Supply Intelligence</p><p className="text-xs text-slate-500">Vein-to-vein visibility · Demo environment</p></div></div><div className="flex items-center gap-3"><Bell size={18} className="text-slate-400"/><span className="hidden text-sm text-slate-600 sm:inline">{user?.firstName||user?.email} · {user?.role}</span><button onClick={logout} title="Sign out" className="rounded-xl border p-2 hover:bg-slate-50"><LogOut size={18}/></button></div></header>
    <div className="mx-5 mt-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900 lg:mx-8"><ShieldAlert size={17}/> Prototype only. Do not enter real donor or patient information.</div>
    <main className="p-5 lg:p-8"><Outlet/></main></div>
  </div>;
}