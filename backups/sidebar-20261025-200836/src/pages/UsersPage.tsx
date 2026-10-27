import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  UserPlus, Users, RefreshCw, ShieldCheck,
  Building2, AlertCircle, CheckCircle2
} from 'lucide-react';

type Row = Record<string, unknown>;

type StaffForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  facilityId: string;
};

const roles = [
  { value: 'HOSPITAL_OFFICER', label: 'Doctor / Hospital Clinician' },
  { value: 'LAB_TECHNICIAN', label: 'Laboratory Technician' },
  { value: 'BLOOD_BANK_OFFICER', label: 'Blood Bank Officer' },
  { value: 'LOGISTICS_OFFICER', label: 'Logistics Officer' },
  { value: 'FACILITY_ADMIN', label: 'Facility Administrator' }
];

const initialForm: StaffForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'HOSPITAL_OFFICER',
  facilityId: ''
};

function rows(value: unknown): Row[] {
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

  return [];
}

function valueOf(value: unknown): string {
  if (value === undefined || value === null) return '—';
  return String(value);
}

export default function UsersPage() {
  const { token, user } = useAuth();

  const [staff, setStaff] = useState<Row[]>([]);
  const [facilities, setFacilities] = useState<Row[]>([]);
  const [form, setForm] = useState<StaffForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reload, setReload] = useState(0);

  const isAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);

      const [usersResult, facilitiesResult] = await Promise.allSettled([
        api<unknown>('/users', {}, token),
        api<unknown>('/facilities', {}, token)
      ]);

      if (!active) return;

      if (usersResult.status === 'fulfilled') {
        setStaff(rows(usersResult.value));
      } else {
        setError(
          usersResult.reason instanceof Error
            ? usersResult.reason.message
            : 'Unable to load users'
        );
      }

      if (facilitiesResult.status === 'fulfilled') {
        setFacilities(rows(facilitiesResult.value));
      } else {
        setError(previous =>
          previous ||
          'Unable to load facilities. Check GET /facilities.'
        );
      }

      setLoading(false);
    }

    void load();

    return () => { active = false; };
  }, [isAdmin, token, reload]);

  function update(field: keyof StaffForm, value: string) {
    setForm(previous => ({ ...previous, [field]: value }));
  }

  async function createStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAdmin) return;

    setError('');
    setSuccess('');

    if (!form.facilityId) {
      setError('Please assign a registered facility.');
      return;
    }

    if (form.password.length < 12) {
      setError('Initial password must contain at least 12 characters.');
      return;
    }

    setSaving(true);

    try {
      await api(
        '/users',
        {
          method: 'POST',
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            role: form.role,
            facilityId: form.facilityId
          })
        },
        token
      );

      setSuccess(
        'Staff account created. The user must receive their credentials ' +
        'through an approved secure channel. Email invitations are not yet configured.'
      );

      setForm(initialForm);
      setReload(previous => previous + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create staff account.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Access restricted</h2>
        <p>Only a Super Admin can access staff administration.</p>
      </div>
    );
  }

  return (
    <div className="staff-admin">
      <header className="staff-header">
        <div>
          <span className="staff-eyebrow">
            AFRIBLOOD / ADMINISTRATION
          </span>
          <h1>Staff & User Management</h1>
          <p>
            Register healthcare professionals and assign facility access.
          </p>
        </div>

        <button
          type="button"
          className="staff-secondary"
          onClick={() => setReload(previous => previous + 1)}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </header>

      <div className="staff-stats">
        <div className="staff-stat">
          <Users size={18} />
          <strong>{staff.length}</strong>
          <span>Users returned by API</span>
        </div>

        <div className="staff-stat">
          <Building2 size={18} />
          <strong>{facilities.length}</strong>
          <span>Registered facilities returned</span>
        </div>

        <div className="staff-stat">
          <ShieldCheck size={18} />
          <strong>Super Admin</strong>
          <span>Current access level</span>
        </div>
      </div>

      {error && (
        <div className="staff-message staff-error" role="alert">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="staff-message staff-success" role="status">
          <CheckCircle2 size={17} />
          <span>{success}</span>
        </div>
      )}

      <div className="staff-grid">
        <section className="staff-panel">
          <div className="staff-panel-title">
            <UserPlus size={19} />
            <div>
              <h2>Add staff member</h2>
              <p>Create a role-based staff account</p>
            </div>
          </div>

          <form onSubmit={createStaff} className="staff-form">
            <div className="staff-two">
              <label>
                First name
                <input
                  required
                  value={form.firstName}
                  onChange={e => update('firstName', e.target.value)}
                  placeholder="Sarah"
                />
              </label>

              <label>
                Last name
                <input
                  required
                  value={form.lastName}
                  onChange={e => update('lastName', e.target.value)}
                  placeholder="Namusoke"
                />
              </label>
            </div>

            <label>
              Official work email
              <input
                required
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="doctor@hospital.org"
              />
            </label>

            <label>
              Staff role
              <select
                value={form.role}
                onChange={e => update('role', e.target.value)}
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Assigned facility
              <select
                required
                value={form.facilityId}
                onChange={e => update('facilityId', e.target.value)}
              >
                <option value="">Select registered facility</option>
                {facilities.map(facility => (
                  <option
                    key={valueOf(facility.id)}
                    value={valueOf(facility.id)}
                  >
                    {valueOf(
                      facility.name ||
                      facility.facilityName ||
                      facility.id
                    )}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Initial password
              <input
                required
                type="password"
                minLength={12}
                autoComplete="new-password"
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="Minimum 12 characters"
              />
            </label>

            <p className="staff-notice">
              This version creates the account using the existing API.
              It does not send an email invitation or implement
              first-login password activation.
            </p>

            <button
              className="staff-primary"
              type="submit"
              disabled={saving || facilities.length === 0}
            >
              <UserPlus size={17} />
              {saving ? 'Creating account...' : 'Create staff account'}
            </button>
          </form>
        </section>

        <section className="staff-panel">
          <div className="staff-panel-title">
            <Users size={19} />
            <div>
              <h2>Registered staff</h2>
              <p>Accounts returned by your backend</p>
            </div>
          </div>

          {loading ? (
            <div className="staff-empty">Loading staff records...</div>
          ) : staff.length === 0 ? (
            <div className="staff-empty">
              No staff records returned.
            </div>
          ) : (
            <div className="staff-table-wrap">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Staff member</th>
                    <th>Role</th>
                    <th>Facility</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((person, index) => (
                    <tr key={valueOf(person.id || index)}>
                      <td>
                        <strong>
                          {[
                            person.firstName,
                            person.lastName
                          ].filter(Boolean).join(' ') || 'Staff member'}
                        </strong>
                        <small>{valueOf(person.email)}</small>
                      </td>
                      <td>{valueOf(person.role).replaceAll('_', ' ')}</td>
                      <td>{valueOf(person.facilityId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
