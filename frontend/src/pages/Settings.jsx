import { ShieldAlert, Server, Database } from 'lucide-react';
import Card from '../components/ui/Card';

export default function Settings() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <ShieldAlert size={20} />
          </div>
          <h2 className="font-semibold text-slate-800">Demo Disclaimer</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          This Hospital Patient Admission and Process Management System (HPMS) is built for a college
          presentation and uses fictional demo data only. It does not implement authentication, role-based
          access control, or real payment processing, and it is not suitable for handling real patient
          information.
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Server size={20} />
          </div>
          <h2 className="font-semibold text-slate-800">API Connection</h2>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Backend URL: <span className="font-mono text-slate-700">{apiUrl}</span>
        </p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Database size={20} />
          </div>
          <h2 className="font-semibold text-slate-800">Data Source</h2>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          All records (patients, doctors, appointments, beds, bills) are stored in MongoDB and loaded live
          through the HPMS REST API — nothing on this screen is hardcoded.
        </p>
      </Card>
    </div>
  );
}
