import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Stethoscope,
  BedDouble,
  Receipt,
  Settings,
  Activity,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/appointments', label: 'Appointments', icon: CalendarClock },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/beds', label: 'Beds & Wards', icon: BedDouble },
  { to: '/billing', label: 'Billing', icon: Receipt },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Activity size={19} strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-800">HPMS</p>
              <p className="text-[11px] text-slate-400">Admin Console</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 p-3.5">
            <p className="text-xs font-semibold text-slate-600">Demo Mode</p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
              This system uses fictional demo data for presentation purposes only.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
