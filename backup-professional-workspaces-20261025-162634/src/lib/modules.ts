import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Building2, Users, HeartHandshake, Droplets, Package, FlaskConical, ClipboardList, Search, Truck, ShieldCheck, HeartPulse, History, FileClock, BrainCircuit, ArrowLeftRight, ChartNoAxesCombined, FileText, Bell, Settings, LockKeyhole, Activity } from 'lucide-react';
export type ModuleDef = { path: string; title: string; icon: LucideIcon; endpoint?: string; roles?: string[]; description: string; fields?: { name: string; label: string; type?: string; required?: boolean; options?: string[] }[] };
export const modules: ModuleDef[] = [
  { path:'/', title:'Dashboard', icon:LayoutDashboard, description:'Operational overview' },
  { path:'/facilities', title:'Facilities', icon:Building2, endpoint:'/facilities', description:'Blood banks, hospitals and laboratories', roles:['SUPER_ADMIN'], fields:[{name:'name',label:'Facility name',required:true},{name:'code',label:'Facility code',required:true},{name:'type',label:'Type',required:true,options:['BLOOD_BANK','COLLECTION_CENTER','LABORATORY','HOSPITAL']},{name:'country',label:'Country',required:true},{name:'region',label:'Region'},{name:'district',label:'District'}] },
  { path:'/users', title:'Users', icon:Users, endpoint:'/users', description:'Administrator-managed user accounts', roles:['SUPER_ADMIN'] },
  { path:'/donors', title:'Donors', icon:HeartHandshake, endpoint:'/donors', description:'Donor registration and records', roles:['SUPER_ADMIN','BLOOD_BANK_OFFICER','FACILITY_ADMIN'], fields:[{name:'donorCode',label:'Donor code',required:true},{name:'firstName',label:'First name',required:true},{name:'lastName',label:'Last name',required:true},{name:'phone',label:'Phone'},{name:'email',label:'Email',type:'email'},{name:'bloodGroup',label:'Blood group',options:['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG']}] },
  { path:'/donations', title:'Donations', icon:Droplets, endpoint:'/donations', description:'Donation collection records' },
  { path:'/inventory', title:'Blood Inventory', icon:Package, endpoint:'/inventory', description:'Blood unit tracking and stock status' },
  { path:'/laboratory', title:'Laboratory', icon:FlaskConical, endpoint:'/laboratory/tests', description:'Laboratory screening results' },
  { path:'/hospital-requests', title:'Hospital Requests', icon:ClipboardList, endpoint:'/hospital-requests', description:'Blood requests from hospitals', roles:['SUPER_ADMIN','HOSPITAL_OFFICER','FACILITY_ADMIN'], fields:[{name:'requestCode',label:'Request code',required:true},{name:'facilityId',label:'Hospital facility UUID',required:true},{name:'bloodGroup',label:'Blood group',required:true,options:['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG']},{name:'component',label:'Component',required:true,options:['WHOLE_BLOOD','RED_CELLS','PLASMA','PLATELETS']},{name:'quantity',label:'Units requested',required:true,type:'number'},{name:'priority',label:'Priority',required:true,options:['ROUTINE','URGENT','EMERGENCY']}] },
  { path:'/stock-matching', title:'Stock Matching', icon:Search, endpoint:'/stock-matching/availability', description:'Available stock by facility and component' },
  { path:'/blood-transfers', title:'Blood Transfers', icon:Truck, endpoint:'/blood-transfers', description:'Interfacility transfer lifecycle' },
  { path:'/reservations', title:'Reservations', icon:ShieldCheck, description:'Not yet connected to a verified backend workflow' },
  { path:'/blood-release', title:'Blood Release', icon:LockKeyhole, description:'Clinical release workflow unavailable in this prototype' },
  { path:'/transfusions', title:'Transfusions', icon:HeartPulse, description:'Transfusion documentation not yet connected' },
  { path:'/traceability', title:'Traceability', icon:History, endpoint:'/blood-unit-events', description:'Blood unit event history' },
  { path:'/audit-logs', title:'Audit Logs', icon:FileClock, endpoint:'/audit-logs', description:'Recorded system activity', roles:['SUPER_ADMIN'] },
  { path:'/forecasting', title:'AI Forecasting', icon:BrainCircuit, description:'AI prediction service not yet connected' },
  { path:'/redistribution', title:'Redistribution', icon:ArrowLeftRight, description:'Redistribution recommendation engine not yet connected' },
  { path:'/analytics', title:'Analytics', icon:ChartNoAxesCombined, description:'Reporting analytics pending verified endpoints' },
  { path:'/reports', title:'Reports', icon:FileText, description:'Report exports pending implementation' },
  { path:'/notifications', title:'Notifications', icon:Bell, description:'Notification service pending implementation' },
  { path:'/settings', title:'Settings', icon:Settings, description:'Application configuration' },
  { path:'/health', title:'System Status', icon:Activity, description:'API connection diagnostics' },
];