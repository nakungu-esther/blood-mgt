import { useEffect, useMemo, useState } from 'react';
import {
  Users, Droplets, FlaskConical, CheckCircle2, Clock3,
  AlertTriangle, Search, RefreshCw, Download, Eye,
  Plus, X, Activity, Filter
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import './ClinicalWorkspace.css';

type Row = Record<string, unknown>;
type Kind = 'donors' | 'donations' | 'laboratory';

type Config = {
  title: string;
  subtitle: string;
  endpoint: string;
  action: string;
  columns: { key: string; label: string }[];
};

const configs: Record<Kind, Config> = {
  donors: {
    title: 'Donors',
    subtitle: 'Manage donor information, donation history and eligibility.',
    endpoint: '/donors',
    action: 'Register Donor',
    columns: [
      { key: 'donorCode', label: 'Donor ID' },
      { key: 'name', label: 'Name' },
      { key: 'bloodGroup', label: 'Blood Group' },
      { key: 'donorType', label: 'Donor Type' },
      { key: 'lastDonationDate', label: 'Last Donation' },
      { key: 'nextEligibleDate', label: 'Next Eligible' },
      { key: 'status', label: 'Status' }
    ]
  },
  donations: {
    title: 'Donations',
    subtitle: 'Track and manage blood donations and collection sessions.',
    endpoint: '/donations',
    action: 'Record Donation',
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'donorName', label: 'Donor Name' },
      { key: 'bloodGroup', label: 'Blood Group' },
      { key: 'component', label: 'Component' },
      { key: 'units', label: 'Units' },
      { key: 'status', label: 'Status' }
    ]
  },
  laboratory: {
    title: 'Laboratory',
    subtitle: 'Manage testing, screening and results for blood units.',
    endpoint: '/laboratory',
    action: 'Record Test',
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'unitCode', label: 'Unit Code' },
      { key: 'bloodGroup', label: 'Blood Group' },
      { key: 'testType', label: 'Test Type' },
      { key: 'result', label: 'Result' },
      { key: 'status', label: 'Status' }
    ]
  }
};

function rows(value: unknown): Row[] | null {
  if (Array.isArray(value)) return value as Row[];
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    for (const key of ['data', 'items', 'results']) {
      if (Array.isArray(obj[key])) return obj[key] as Row[];
      const nested = obj[key];
      if (nested && typeof nested === 'object') {
        const inner = nested as Record<string, unknown>;
        if (Array.isArray(inner.data)) return inner.data as Row[];
      }
    }
  }
  return null;
}

function text(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return '—';
  return String(value).replaceAll('_', ' ');
}

function field(row: Row, key: string): unknown {
  const aliases: Record<string, string[]> = {
    donorCode: ['donorCode', 'donorId', 'code', 'id'],
    name: ['name', 'fullName', 'donorName'],
    donorName: ['donorName', 'name', 'donorId'],
    date: ['date', 'donationDate', 'testDate', 'createdAt'],
    lastDonationDate: ['lastDonationDate', 'lastDonation'],
    nextEligibleDate: ['nextEligibleDate', 'nextEligible'],
    unitCode: ['unitCode', 'bloodUnitCode', 'unitId'],
    units: ['units', 'unitsCollected', 'quantity'],
    status: ['status', 'donationStatus', 'testStatus'],
    result: ['result', 'testResult'],
    bloodGroup: ['bloodGroup', 'aboRh']
  };

  for (const alias of aliases[key] || [key]) {
    const value = row[alias];
    if (value !== undefined && value !== null) return value;
  }

  if (key === 'name' && (row.firstName || row.lastName)) {
    return [row.firstName, row.lastName].filter(Boolean).join(' ');
  }

  return undefined;
}

const palette = [
  '#ed3348', '#2878ed', '#1eb981', '#ff9c27',
  '#7749db', '#1a9ba8', '#9aaecb', '#64748b'
];

export default function ClinicalWorkspace({ kind }: { kind: Kind }) {
  const config = configs[kind];
  const { token } = useAuth();

  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);
  const [showActionInfo, setShowActionInfo] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const response = await api<unknown>(config.endpoint, {}, token);
        const result = rows(response);

        if (active) {
          if (result === null) {
            setData([]);
            setError('The API returned an unsupported response format.');
          } else {
            setData(result);
          }
        }
      } catch (err) {
        if (active) {
          setData([]);
          setError(err instanceof Error ? err.message : 'API request failed');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, [config.endpoint, token, reload]);

  const filtered = useMemo(() => data.filter(row => {
    const searchable = Object.values(row)
      .filter(v => typeof v === 'string' || typeof v === 'number')
      .join(' ')
      .toLowerCase();

    const matchesSearch = searchable.includes(search.toLowerCase());
    const matchesGroup = !groupFilter ||
      String(field(row, 'bloodGroup') || '') === groupFilter;
    const matchesStatus = !statusFilter ||
      String(field(row, 'status') || '') === statusFilter;

    return matchesSearch && matchesGroup && matchesStatus;
  }), [data, search, groupFilter, statusFilter]);

  const groups = useMemo(() => {
    const result: Record<string, number> = {};

    data.forEach(row => {
      const value = field(row, 'bloodGroup');
      if (value) {
        const key = String(value);
        result[key] = (result[key] || 0) + 1;
      }
    });

    return Object.entries(result).sort((a, b) => b[1] - a[1]);
  }, [data]);

  const statuses = useMemo(() => {
    const result: Record<string, number> = {};

    data.forEach(row => {
      const key = String(field(row, 'status') || 'UNKNOWN').toUpperCase();
      result[key] = (result[key] || 0) + 1;
    });

    return result;
  }, [data]);

  const active = statuses.ACTIVE || 0;
  const completed = (statuses.COMPLETED || 0) + (statuses.PASSED || 0);
  const pending = statuses.PENDING || 0;
  const failed = (statuses.FAILED || 0) + (statuses.DEFERRED || 0);

  const metrics = kind === 'donors'
    ? [
        { label: 'Total Donors', value: data.length, icon: Users, color: 'blue' },
        { label: 'Active Donors', value: active, icon: Droplets, color: 'green' },
        { label: 'Recorded Donations', value: null, icon: Activity, color: 'blue' },
        { label: 'Eligible Donors', value: null, icon: CheckCircle2, color: 'orange' }
      ]
    : kind === 'donations'
    ? [
        { label: 'Total Donations', value: data.length, icon: Droplets, color: 'red' },
        { label: 'Completed', value: completed, icon: CheckCircle2, color: 'green' },
        { label: 'Pending', value: pending, icon: Clock3, color: 'orange' },
        { label: 'Deferred', value: statuses.DEFERRED || 0, icon: AlertTriangle, color: 'red' }
      ]
    : [
        { label: 'Total Tests', value: data.length, icon: FlaskConical, color: 'blue' },
        { label: 'Passed', value: statuses.PASSED || 0, icon: CheckCircle2, color: 'green' },
        { label: 'Failed', value: failed, icon: AlertTriangle, color: 'red' },
        { label: 'Pending', value: pending, icon: Clock3, color: 'orange' }
      ];

  const totalPages = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * 8, currentPage * 8);

  const totalGroups = groups.reduce((sum, [, count]) => sum + count, 0);
  let progress = 0;

  const segments = groups.map(([, count], index) => {
    const start = progress;
    progress += totalGroups ? count / totalGroups * 100 : 0;
    return `${palette[index % palette.length]} ${start}% ${progress}%`;
  }).join(', ');

  function exportCsv() {
    const quote = (value: unknown) =>
      '"' + text(value).replaceAll('"', '""') + '"';

    const csv = [
      config.columns.map(c => quote(c.label)).join(','),
      ...filtered.map(row =>
        config.columns.map(c => quote(field(row, c.key))).join(',')
      )
    ].join('\r\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' })
    );

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `afriblood-${kind}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="abc-workspace">
      <header className="abc-heading">
        <div className="abc-heading-left">
          <span className="abc-heading-icon">
            {kind === 'donors' ? <Users size={25}/> :
              kind === 'donations' ? <Droplets size={25}/> :
              <FlaskConical size={25}/>}
          </span>
          <div>
            <h1>{config.title}</h1>
            <p>{config.subtitle}</p>
          </div>
        </div>
        <button
          className="abc-primary"
          onClick={() => setShowActionInfo(true)}
        >
          <Plus size={15}/> {config.action}
        </button>
      </header>

      {error && <div className="abc-error" role="alert">{error}</div>}

      <section className="abc-metrics">
        {metrics.map(metric => {
          const Icon = metric.icon;

          return (
            <article className="abc-metric" key={metric.label}>
              <span className={`abc-metric-icon abc-${metric.color}`}>
                <Icon size={22}/>
              </span>
              <div>
                <span>{metric.label}</span>
                <strong>
                  {loading ? '…' : error || metric.value === null
                    ? '—' : metric.value.toLocaleString()}
                </strong>
                <small>
                  {metric.value === null
                    ? 'Requires a dedicated API'
                    : 'Records returned by API'}
                </small>
              </div>
            </article>
          );
        })}
      </section>

      <div className="abc-body">
        <div className="abc-main">
          <section className="abc-card abc-filters">
            <div className="abc-search">
              <Search size={15}/>
              <input
                value={search}
                placeholder={`Search ${kind}...`}
                onChange={e => {setSearch(e.target.value);setPage(1);}}
              />
            </div>

            <select value={groupFilter} onChange={e => {
              setGroupFilter(e.target.value);setPage(1);
            }}>
              <option value="">All Blood Groups</option>
              {groups.map(([group]) => (
                <option value={group} key={group}>{group}</option>
              ))}
            </select>

            <select value={statusFilter} onChange={e => {
              setStatusFilter(e.target.value);setPage(1);
            }}>
              <option value="">All Statuses</option>
              {Object.keys(statuses).map(status => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <button className="abc-secondary" onClick={() => {
              setSearch('');setGroupFilter('');setStatusFilter('');setPage(1);
            }}>
              <Filter size={14}/> Clear
            </button>
          </section>

          <section className="abc-card abc-table-card">
            <div className="abc-card-header">
              <h2>Recent {config.title}</h2>
              <div className="abc-header-actions">
                <button className="abc-secondary" onClick={() => setReload(n => n + 1)}>
                  <RefreshCw size={14}/> Refresh
                </button>
                <button className="abc-secondary" onClick={exportCsv}>
                  <Download size={14}/> Export
                </button>
              </div>
            </div>

            <div className="abc-table-scroll">
              <table>
                <thead>
                  <tr>
                    {config.columns.map(col => <th key={col.key}>{col.label}</th>)}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row, index) => (
                    <tr key={String(row.id || index)}>
                      {config.columns.map(col => {
                        const value = field(row, col.key);
                        return (
                          <td key={col.key}>
                            {col.key === 'status' ? (
                              <span className={`abc-status abc-status-${String(value || '').toLowerCase()}`}>
                                {text(value)}
                              </span>
                            ) : text(value)}
                          </td>
                        );
                      })}
                      <td>
                        <button className="abc-view" onClick={() => setSelected(row)}>
                          <Eye size={13}/> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && visible.length === 0 && (
                <p className="abc-empty">
                  {error ? 'Unable to retrieve records.' : 'No matching records found.'}
                </p>
              )}
            </div>

            <footer className="abc-pagination">
              <span>Showing {visible.length} of {filtered.length} returned records</span>
              <div>
                <button disabled={currentPage <= 1} onClick={() => setPage(n => n - 1)}>
                  Previous
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button disabled={currentPage >= totalPages} onClick={() => setPage(n => n + 1)}>
                  Next
                </button>
              </div>
            </footer>
          </section>
        </div>

        <aside className="abc-aside">
          <section className="abc-card">
            <div className="abc-card-header">
              <h2>{kind === 'laboratory' ? 'Test Results Overview' :
                kind === 'donations' ? 'Donations by Blood Group' :
                'Donor Blood Groups'}</h2>
            </div>

            {totalGroups === 0 ? (
              <p className="abc-empty">No blood group data returned.</p>
            ) : (
              <div className="abc-donut-content">
                <div
                  className="abc-donut"
                  style={{background:`conic-gradient(${segments})`}}
                >
                  <div>
                    <strong>{totalGroups}</strong>
                    <small>Records</small>
                  </div>
                </div>
                <div className="abc-legend">
                  {groups.map(([group, count], i) => (
                    <div key={group}>
                      <i style={{background:palette[i % palette.length]}}/>
                      <span>{group}</span>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="abc-card">
            <div className="abc-card-header">
              <h2>Activity Summary</h2>
            </div>
            {Object.entries(statuses).length === 0 ? (
              <p className="abc-empty">No status information available.</p>
            ) : Object.entries(statuses).map(([status, count]) => (
              <div className="abc-activity" key={status}>
                <span className="abc-activity-dot"/>
                <span>{text(status)}</span>
                <strong>{count}</strong>
              </div>
            ))}
            <p className="abc-note">
              This summary is derived from current records, not a historical audit log.
            </p>
          </section>
        </aside>
      </div>

      {(selected || showActionInfo) && (
        <div className="abc-overlay" onClick={() => {
          setSelected(null);setShowActionInfo(false);
        }}>
          <div className="abc-dialog" onClick={e => e.stopPropagation()}>
            <div className="abc-card-header">
              <h2>{selected ? 'Record Details' : config.action}</h2>
              <button className="abc-secondary" onClick={() => {
                setSelected(null);setShowActionInfo(false);
              }}>
                <X size={16}/>
              </button>
            </div>

            {selected ? (
              Object.entries(selected)
                .filter(([key]) => !/password|token|secret|patient|medicalHistory|nationalId|phone|address/i.test(key))
                .map(([key, value]) => (
                  <div className="abc-detail" key={key}>
                    <span>{key}</span>
                    <strong>{text(value)}</strong>
                  </div>
                ))
            ) : (
              <div className="abc-info">
                <AlertTriangle size={22}/>
                <p>
                  Creating {kind === 'donors' ? 'donor records' :
                    kind === 'donations' ? 'donation records' :
                    'laboratory test records'} requires the verified NestJS
                  creation endpoint and its validation schema.
                </p>
                <p>
                  This action is not enabled until the backend integration
                  is confirmed. No record has been submitted.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
