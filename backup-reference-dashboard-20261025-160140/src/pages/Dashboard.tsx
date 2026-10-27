import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowRight, ArrowUpRight, Building2, CheckCircle2, Clock3, Droplets, FileText, RefreshCw, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type Row = Record<string, unknown>;
type Result = { rows: Row[] | null; error?: string; total?: number };
const groups = ['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'];
const labelGroup = (v:string) => v.replace('_POS','+').replace('_NEG','âˆ’');
const color: Record<string,string> = {AVAILABLE:'#20a879',RESERVED:'#f5b544',QUARANTINED:'#ee5264'};
const fmt=(n:number)=>n.toLocaleString();
function unpack(value:unknown):Result {
 if(Array.isArray(value))return {rows:value as Row[],total:value.length};
 if(value && typeof value==='object'){
  const obj=value as Record<string,unknown>;
  for(const key of ['data','items','results','records']){
   const val=obj[key];
   if(Array.isArray(val))return {rows:val as Row[],total:typeof obj.total==='number'?obj.total:undefined};
   if(val && typeof val==='object' && Array.isArray((val as Record<string,unknown>).data))return {rows:(val as {data:Row[]}).data,total:typeof obj.total==='number'?obj.total:undefined};
  }
 }
 return {rows:null,error:'Unsupported API response format'};
}
function value(r:Row,k:string){return String(r[k]??'');}
function formatDate(v:unknown){if(!v)return 'â€”';const d=new Date(String(v));return Number.isNaN(d.getTime())?'â€”':d.toLocaleDateString(undefined,{day:'numeric',month:'short'});}
const endpoints={inventory:'/inventory',requests:'/hospital-requests',facilities:'/facilities',events:'/blood-unit-events',transfers:'/blood-transfers',forecasts:'/demand-forecasting'} as const;
type Key=keyof typeof endpoints;
export default function Dashboard(){
 const {token}=useAuth();
 const [data,setData]=useState<Partial<Record<Key,Result>>>({});
 const [busy,setBusy]=useState(true);
 const [refresh,setRefresh]=useState(0);
 const [updated,setUpdated]=useState('');
 useEffect(()=>{
  let active=true;setBusy(true);
  Promise.all((Object.entries(endpoints) as [Key,string][]).map(async ([key,url])=>{
   try{return [key,unpack(await api(url,{},token))] as const}
   catch(e){return [key,{rows:null,error:e instanceof Error?e.message:'Request failed'}] as const}
  })).then(entries=>{if(active){setData(Object.fromEntries(entries));setUpdated(new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}));setBusy(false)}});
  return()=>{active=false};
 },[token,refresh]);
 const inv=data.inventory?.rows, req=data.requests?.rows,fac=data.facilities?.rows;
 const stock=useMemo(()=>{
  const counts:Record<string,Record<string,number>>={};
  for(const group of groups)counts[group]={AVAILABLE:0,RESERVED:0,QUARANTINED:0};
  for(const row of inv||[]){const g=value(row,'bloodGroup'),s=value(row,'status');if(counts[g] && s in color)counts[g][s]++}
  return groups.map(group=>({group:labelGroup(group),...counts[group]}));
 },[inv]);
 const statuses=useMemo(()=>{const out:Record<string,number>={};for(const row of inv||[]){const s=value(row,'status');out[s]=(out[s]||0)+1}return out},[inv]);
 const components=useMemo(()=>{const out:Record<string,number>={};for(const row of inv||[]){const k=value(row,'component')||'UNSPECIFIED';out[k]=(out[k]||0)+1}return Object.entries(out).map(([name,count])=>({name:name.replaceAll('_',' '),count})).sort((a,b)=>b.count-a.count)},[inv]);
 const now=Date.now(),week=7*86400000;
 const expiring=inv?.filter(r=>{const d=new Date(value(r,'expiresAt')).getTime();return Number.isFinite(d)&&d>now&&d<=now+week&&value(r,'status')!=='DISCARDED'&&value(r,'status')!=='EXPIRED'}).length;
 const pending=req?.filter(r=>['PENDING','APPROVED','PARTIALLY_FULFILLED'].includes(value(r,'status'))).length;
 const statCards=[
  {title:'Total blood units',val:inv?.length,icon:Droplets,style:'rose',desc:'Inventory records returned',to:'/inventory'},
  {title:'Available units',val:inv?statuses.AVAILABLE||0:undefined,icon:CheckCircle2,style:'green',desc:'Recorded as AVAILABLE',to:'/inventory'},
  {title:'Expiring within 7 days',val:expiring,icon:Clock3,style:'amber',desc:'Not yet expired',to:'/inventory'},
  {title:'Active requests',val:pending,icon:FileText,style:'blue',desc:'Pending or in progress',to:'/hospital-requests'},
 ];
 const recentEvents=(data.events?.rows||[]).slice().sort((a,b)=>new Date(value(b,'occurredAt')||value(b,'createdAt')).getTime()-new Date(value(a,'occurredAt')||value(a,'createdAt')).getTime()).slice(0,6);
 const topRequests=(req||[]).slice().sort((a,b)=>{const p:Record<string,number>={EMERGENCY:0,URGENT:1,ROUTINE:2};return (p[value(a,'priority')]??3)-(p[value(b,'priority')]??3)}).slice(0,5);
 const facilities=fac||[];
 const stockByFacility=useMemo(()=>{
  const map=new Map<string,{name:string,units:number,available:number}>();
  for(const f of facilities)map.set(value(f,'id'),{name:value(f,'name')||value(f,'code')||'Facility',units:0,available:0});
  for(const u of inv||[]){const id=value(u,'facilityId'),record=map.get(id);if(record){record.units++;if(value(u,'status')==='AVAILABLE')record.available++}}
  return [...map.values()].sort((a,b)=>b.units-a.units).slice(0,6);
 },[facilities,inv]);
 const pieColors=['#f05261','#f9b74e','#8d67db','#3e90e6','#25a87e','#7b8da5'];
 const apiErrors=Object.entries(data).filter(([,r])=>!r?.rows).length;
 return <div className="ab-dashboard space-y-4 sm:space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <div><p className="text-xs font-semibold text-slate-500">OPERATIONS / OVERVIEW</p><h1 className="mt-1 text-[30px] font-extrabold tracking-tight text-[#13243c]">Dashboard</h1><p className="text-sm text-slate-500">Blood supply, requests and network activity at a glance.</p></div>
   <div className="flex items-center gap-2"><span className="hidden text-xs text-slate-400 sm:inline">{updated?`Updated ${updated}`:'Connectingâ€¦'}</span><button className="action" onClick={()=>setRefresh(n=>n+1)} disabled={busy}><RefreshCw size={15} className={busy?'animate-spin':''}/>Refresh</button></div>
  </div>
  {apiErrors>0&&!busy&&<div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertCircle size={18} className="mt-0.5 shrink-0"/><span>{apiErrors} data source{apiErrors>1?'s are':' is'} unavailable or not yet implemented. Unavailable values are shown as dashes; no sample records are substituted. <Link className="font-bold underline" to="/health">Check system status</Link>.</span></div>}
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{statCards.map(card=><Link to={card.to} key={card.title} className="ab-panel group flex min-h-[136px] items-start gap-4 p-5 transition hover:border-slate-300 hover:shadow-md"><span className={`ab-stat-icon ${card.style}`}><card.icon size={23}/></span><div className="min-w-0 flex-1"><div className="text-[12px] font-medium text-slate-500">{card.title}</div><div className="mt-2 text-[29px] font-extrabold leading-none tracking-tight text-[#102743]">{busy?'â€¦':card.val===undefined?'â€”':fmt(card.val)}</div><p className="mt-3 text-[11px] text-slate-400">{card.desc}</p></div><ArrowUpRight size={16} className="text-slate-300 group-hover:text-[#bf3149]"/></Link>)}</div>
  <div className="grid gap-3 xl:grid-cols-[1.35fr_1fr_0.93fr]">
   <section className="ab-panel p-5"><div className="ab-panel-head"><div><h2>Inventory by blood group</h2><p>Available, reserved and quarantined units</p></div><Link to="/inventory">View stock <ArrowRight size={14}/></Link></div>
    {inv?<div className="h-[295px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={stock} margin={{top:10,right:2,bottom:0,left:-24}}><CartesianGrid stroke="#edf1f5" vertical={false}/><XAxis dataKey="group" tickLine={false} axisLine={false} tick={{fontSize:11,fill:'#64748b'}}/><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{fontSize:11,fill:'#64748b'}}/><Tooltip/><Legend iconType="circle" iconSize={9} wrapperStyle={{fontSize:11}}/><Bar dataKey="AVAILABLE" name="Available" stackId="a" fill={color.AVAILABLE}/><Bar dataKey="RESERVED" name="Reserved" stackId="a" fill={color.RESERVED}/><Bar dataKey="QUARANTINED" name="Quarantined" stackId="a" fill={color.QUARANTINED} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>:<Empty label="Inventory data unavailable"/>}
   </section>
   <section className="ab-panel p-5"><div className="ab-panel-head"><div><h2>Inventory by component</h2><p>Composition of returned stock</p></div></div>
    {inv?<><div className="relative h-[215px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={components} dataKey="count" nameKey="name" innerRadius={68} outerRadius={91} stroke="none">{components.map((c,i)=><Cell key={c.name} fill={pieColors[i%pieColors.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-[24px] font-extrabold text-[#13243c]">{fmt(inv.length)}</strong><span className="text-[11px] text-slate-500">Total units</span></div></div><div className="space-y-2">{components.slice(0,5).map((c,i)=><div key={c.name} className="flex items-center gap-2 text-[12px]"><span className="h-2.5 w-2.5 rounded-full" style={{background:pieColors[i%pieColors.length]}}/><span className="flex-1 text-slate-600">{c.name}</span><strong className="text-slate-700">{inv.length?Math.round(c.count/inv.length*100):0}%</strong><span className="w-9 text-right text-slate-400">{c.count}</span></div>)}{!components.length&&<p className="text-sm text-slate-400">No inventory records.</p>}</div></>:<Empty label="Component data unavailable"/>}
   </section>
   <section className="ab-panel p-5"><div className="ab-panel-head"><div><h2>Recent activity</h2><p>Blood unit event history</p></div><Link to="/traceability">View all</Link></div>
    {data.events?.rows?<div className="divide-y divide-slate-100">{recentEvents.map((e,i)=><div key={value(e,'id')||i} className="flex gap-3 py-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600"><Activity size={16}/></span><div className="min-w-0 flex-1"><p className="line-clamp-2 text-[12px] font-semibold text-slate-700">{value(e,'eventType').replaceAll('_',' ')||'Blood unit event'}</p><p className="mt-1 line-clamp-2 text-[11px] text-slate-400">{value(e,'description')||`Unit: ${value(e,'bloodUnitId')||'Not specified'}`}</p></div><span className="shrink-0 text-[10px] text-slate-400">{formatDate(e.occurredAt||e.createdAt)}</span></div>)}{!recentEvents.length&&<p className="py-12 text-center text-sm text-slate-400">No events recorded yet.</p>}</div>:<Empty label="Activity feed unavailable"/>}
   </section>
  </div>
  <div className="grid gap-3 xl:grid-cols-[1.05fr_1.35fr]">
   <section className="ab-panel p-5"><div className="ab-panel-head"><div><h2>Blood availability across facilities</h2><p>Facilities ranked by returned inventory</p></div><Link to="/facilities">Facilities <ArrowRight size={14}/></Link></div>
    {fac&&inv?<div className="space-y-3 pt-2">{stockByFacility.map((f,i)=>{const max=Math.max(1,...stockByFacility.map(x=>x.units));return <div key={i} className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700"><Building2 size={15}/></span><div className="min-w-0 flex-1"><div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate font-semibold text-slate-700">{f.name}</span><span className="shrink-0 text-slate-500">{f.available} available / {f.units} total</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{width:`${100*f.units/max}%`}}/></div></div></div>})}{!stockByFacility.length&&<p className="py-10 text-center text-sm text-slate-400">No facilities returned.</p>}</div>:<Empty label="Facility coverage data unavailable"/>}
   </section>
   <section className="ab-panel overflow-hidden"><div className="ab-panel-head px-5 pt-5"><div><h2>Priority blood requests</h2><p>Highest priority requests from connected facilities</p></div><Link to="/hospital-requests">View all <ArrowRight size={14}/></Link></div>
    {req?<div className="overflow-x-auto"><table className="w-full min-w-[490px] text-left text-xs"><thead className="bg-slate-50 text-[11px] text-slate-500"><tr><th className="px-5 py-3 font-semibold">Request</th><th className="px-3 py-3 font-semibold">Blood group</th><th className="px-3 py-3 font-semibold">Units</th><th className="px-3 py-3 font-semibold">Priority</th><th className="px-4 py-3 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{topRequests.map((r,i)=><tr key={value(r,'id')||i}><td className="max-w-[200px] truncate px-5 py-3.5 font-semibold text-slate-700">{value(r,'requestCode')||value(r,'facilityId')||'Request'}</td><td className="px-3 py-3.5">{labelGroup(value(r,'bloodGroup'))}</td><td className="px-3 py-3.5">{value(r,'quantity')}</td><td className="px-3 py-3.5"><span className={value(r,'priority')==='EMERGENCY'?'font-bold text-rose-600':value(r,'priority')==='URGENT'?'font-semibold text-amber-600':'text-slate-500'}>{value(r,'priority')||'â€”'}</span></td><td className="px-4 py-3.5"><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{value(r,'status').replaceAll('_',' ')||'â€”'}</span></td></tr>)}{!topRequests.length&&<tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No requests recorded yet.</td></tr>}</tbody></table></div>:<Empty label="Request data unavailable"/>}
   </section>
  </div>
  <section className="ab-ai-panel flex flex-wrap items-center justify-between gap-5 rounded-2xl p-5 sm:p-6"><div className="flex min-w-0 items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-200"><Sparkles size={22}/></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-bold text-white">AI intelligence</h2><span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-sky-100">Advisory only</span></div><p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-200">{data.forecasts?.rows?.length?'Forecast records are available. Review their dates, model assumptions and confidence before operational planning.':'Demand forecasts are not available from the backend yet. Connect the forecasting service to enable evidence-based planning insights.'}</p></div></div><Link to="/forecasting" className="inline-flex items-center gap-2 rounded-xl border border-sky-300/40 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10">Open forecasting <ArrowRight size={15}/></Link></section>
  <p className="text-[11px] leading-relaxed text-slate-400">Dashboard reflects records returned by available endpoints, which may be paginated or facility-scoped. Figures are not national totals. Stock status and AI output do not constitute authorization for clinical release or transfusion.</p>
 </div>;
}
function Empty({label}:{label:string}){return <div className="flex min-h-[190px] flex-col items-center justify-center gap-3 text-center text-sm text-slate-400"><ShieldAlert size={26}/>{label}</div>}

