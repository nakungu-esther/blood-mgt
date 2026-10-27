import { useState, type FormEvent } from 'react';
import { Droplets, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function Login() {
  const {login} = useAuth();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent) { e.preventDefault(); setBusy(true);setError('');try {await login(email,password);} catch(e) {setError(e instanceof Error?e.message:'Login failed');}finally{setBusy(false);} }
  return <div className="min-h-screen bg-[#0c1830] flex items-center justify-center p-5"><div className="w-full max-w-md rounded-3xl bg-white p-9 shadow-2xl">
    <div className="mb-7 flex items-center gap-3"><div className="rounded-2xl bg-red-600 p-3 text-white"><Droplets size={27}/></div><div><h1 className="text-2xl font-black text-slate-900">AfriBlood</h1><p className="text-xs tracking-[.22em] text-slate-500">INTELLIGENCE</p></div></div>
    <h2 className="text-2xl font-bold">Welcome back</h2><p className="mt-2 text-sm text-slate-500">Sign in with an administrator-provisioned account.</p>
    <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-medium">Email<input className="mt-2 w-full rounded-xl border border-slate-300 p-3" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <label className="block text-sm font-medium">Password<input className="mt-2 w-full rounded-xl border border-slate-300 p-3" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
    {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700">{busy?'Signing in…':'Sign in'}<ArrowRight size={18}/></button></form>
    <p className="mt-7 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={15}/> Prototype · Synthetic records only · No clinical use</p>
  </div></div>;
}