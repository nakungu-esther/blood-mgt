import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowUpRight, Building2, ClipboardList,
  Droplets, HeartHandshake, Package, RefreshCw,
  ShieldCheck, Truck, Users, AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type RecordRow = Record<string, unknown>;
type Dataset = {
  rows: RecordRow[] | null;
  error: string | null;
};

type Metric = {
  label: string;
  endpoint: string;
  path: string;
  icon: typeof Package;
};

const metrics: Metric[] = [
  { label: 'Blood inventory', endpoint: '/inventory', path: '/inventory', icon: Package },
  { label: 'Hospital requests', endpoint: '/hospital-requests', path: '/hospital-requests', icon: ClipboardList },
  { label: 'Registered donors', endpoint: '/donors', path: '/donors', icon: HeartHandshake },
  { label: 'Facilities', endpoint: '/facilities', path: '/facilities', icon: Building2 }
];

function extractRows(value: unknown): RecordRow[] | null {
  if (Array.isArray(value)) return value as RecordRow[];

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    for (const key of ['data', 'items', 'results']) {
      if (Array.isArray(obj[key])) {
        return obj[key] as RecordRow[];
      }

      const nested = obj[key];

      if (nested && typeof nested === 'object') {
        const n = nested as Record<string, unknown>;
        if (Array.isArray(n.data)) return n.data as RecordRow[];
      }
    }
  }

  return null;
}

function display(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return '—';
  return String(value).replaceAll('_', ' ');
}

function getRoleTitle(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN': return 'Network administration';
    case 'FACILITY_ADMIN': return 'Facility operations';
    case 'HOSPITAL_OFFICER': return 'Clinical requests';
    case 'BLOOD_BANK_OFFICER': return 'Blood bank operations';
    case 'LAB_TECHNICIAN': return 'Laboratory operations';
    case 'LOGISTICS_OFFICER': return 'Transfer operations';
    default: return 'Operational overview';
  }
}

function getActions(role: string) {
  if (role === 'HOSPITAL_OFFICER') {
    return [
      { title: 'Create blood request', path: '/hospital-requests', icon: ClipboardList },
      { title: 'Check availability', path: '/stock-matching', icon: Droplets },
      { title: 'Track requests', path: '/hospital-requests', icon: Activity }
    ];
  }

  if (role === 'LAB_TECHNICIAN') {
    return [
      { title: 'Laboratory records', path: '/laboratory', icon: ShieldCheck },
      { title: 'Blood inventory', path: '/inventory', icon: Package },
      { title: 'Traceability', path: '/traceability', icon: Activity }
    ];
  }

  if (role === 'BLOOD_BANK_OFFICER') {
    return [
      { title: 'Manage inventory', path: '/inventory', icon: Package },
      { title: 'Donor records', path: '/donors', icon: HeartHandshake },
      { title: 'Donation records', path: '/donations', icon: Droplets }
    ];
  }

  if (role === 'LOGISTICS_OFFICER') {
    return [
      { title: 'Blood transfers', path: '/blood-transfers', icon: Truck },
      { title: 'Stock availability', path: '/stock-matching', icon: Package },
      { title: 'Traceability', path: '/traceability', icon: Activity }
    ];
  }

  if (role === 'SUPER_ADMIN') {
    return [
      { title: 'Manage users', path: '/users', icon: Users },
      { title: 'Manage facilities', path: '/facilities', icon: Building2 },
      { title: 'Blood inventory', path: '/inventory', icon: Package }
    ];
  }

  return [
    { title: 'Blood inventory', path: '/inventory', icon: Package },
    { title: 'Hospital requests', path: '/hospital-requests', icon: ClipboardList },
    { title: 'Transfers', path: '/blood-transfers', icon: Truck }
  ];
}

export default function Dashboard() {
  const { token, user } = useAuth();
  const [datasets, setDatasets] = useState<Record<string, Dataset>>({});
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const role = user?.role || '';
  const actions = getActions(role);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);

      const entries = await Promise.all(
        metrics.map(async (metric) => {
          try {
            const result = await api<unknown>(metric.endpoint, {}, token);
            return [
              metric.endpoint,
              { rows: extractRows(result), error: null }
            ] as const;
          } catch (error) {
            return [
              metric.endpoint,
              {
                rows: null,
                error: error instanceof Error ? error.message : 'Request failed'
              }
            ] as const;
          }
        })
      );

      if (active) {
        setDatasets(Object.fromEntries(entries));
        setLoading(false);
      }
    }

    void load();

    return () => { active = false; };
  }, [token, refresh]);

  const requests = datasets['/hospital-requests']?.rows;
  const inventory = datasets['/inventory']?.rows;

  const statusCounts = inventory?.reduce<Record<string, number>>((acc, item) => {
    const status = String(item.status || 'UNKNOWN');
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}) || {};

  const maxStatus = Math.max(1, ...Object.values(statusCounts));

  return (
    <div className="ab-pro">
      <div className="ab-heading">
        <div>
          <div className="ab-eyebrow">AFRIBLOOD INTELLIGENCE / OPERATIONS</div>
          <h1>{getRoleTitle(role)}</h1>
          <p>Live operational information from your connected blood management system.</p>
        </div>

        <button
          className="ab-refresh"
          type="button"
          onClick={() => setRefresh(value => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={15} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="ab-metrics">
        {metrics.map(metric => {
          const Icon = metric.icon;
          const data = datasets[metric.endpoint];
          const unavailable = !loading && (!data || data.rows === null);

          return (
            <Link to={metric.path} className="ab-metric" key={metric.endpoint}>
              <div className="ab-metric-top">
                <span className="ab-metric-icon"><Icon size={17} /></span>
                <ArrowUpRight size={15} className="ab-muted" />
              </div>
              <div className="ab-metric-value">
                {loading ? '…' : unavailable ? '—' : data.rows?.length.toLocaleString()}
              </div>
              <div className="ab-metric-label">{metric.label}</div>
              {unavailable && <span className="ab-unavailable">API unavailable or restricted</span>}
            </Link>
          );
        })}
      </div>

      <div className="ab-section-heading">
        <div>
          <h2>Your workspace</h2>
          <p>Common tasks for your assigned role</p>
        </div>
      </div>

      <div className="ab-actions">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Link to={action.path} key={action.title} className="ab-action">
              <span className="ab-action-icon"><Icon size={19} /></span>
              <span>{action.title}</span>
              <ArrowUpRight size={15} className="ab-muted" />
            </Link>
          );
        })}
      </div>

      <div className="ab-content-grid">
        <section className="ab-panel">
          <div className="ab-panel-heading">
            <div>
              <h2>Inventory status</h2>
              <p>Distribution of returned inventory records</p>
            </div>
            <Link to="/inventory">View inventory</Link>
          </div>

          {inventory === null || inventory === undefined ? (
            <div className="ab-empty">
              <AlertCircle size={20} />
              <span>Inventory data is unavailable for this account.</span>
            </div>
          ) : Object.keys(statusCounts).length === 0 ? (
            <div className="ab-empty">No inventory records returned.</div>
          ) : (
            <div className="ab-status-list">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div className="ab-status-row" key={status}>
                  <div className="ab-status-label">
                    <span>{display(status)}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="ab-track">
                    <div style={{ width: `${(count / maxStatus) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="ab-panel">
          <div className="ab-panel-heading">
            <div>
              <h2>Account and access</h2>
              <p>Authenticated staff profile</p>
            </div>
            <ShieldCheck size={19} className="ab-teal" />
          </div>

          <div className="ab-profile">
            <div className="ab-profile-avatar">
              {(user?.firstName || user?.email || 'U').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <strong>{[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Staff member'}</strong>
              <p>{user?.email || 'No email available'}</p>
            </div>
          </div>

          <div className="ab-detail">
            <span>Assigned role</span>
            <strong>{display(role)}</strong>
          </div>
          <div className="ab-detail">
            <span>Facility ID</span>
            <strong>{display(user?.facilityId)}</strong>
          </div>
          <div className="ab-detail">
            <span>Session</span>
            <strong className="ab-teal">Authenticated</strong>
          </div>
        </section>
      </div>

      <section className="ab-panel ab-requests">
        <div className="ab-panel-heading">
          <div>
            <h2>Hospital blood requests</h2>
            <p>Latest records returned by the API</p>
          </div>
          <Link to="/hospital-requests">All requests</Link>
        </div>

        {requests === null || requests === undefined ? (
          <div className="ab-empty">Request data is unavailable for this account.</div>
        ) : requests.length === 0 ? (
          <div className="ab-empty">No blood requests have been returned.</div>
        ) : (
          <div className="ab-table-wrap">
            <table className="ab-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Blood group</th>
                  <th>Component</th>
                  <th>Units</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 8).map((request, index) => (
                  <tr key={String(request.id || index)}>
                    <td>{display(request.requestCode || request.id)}</td>
                    <td>{display(request.bloodGroup)}</td>
                    <td>{display(request.component)}</td>
                    <td>{display(request.quantity)}</td>
                    <td>{display(request.priority)}</td>
                    <td>{display(request.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="ab-footer-note">
        <Activity size={14} />
        Values represent API-returned records, not verified national totals.
        Clinical decisions require authorised review.
      </div>
    </div>
  );
}
