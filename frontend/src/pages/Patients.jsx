import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, UserPlus } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getPatients } from '../services/patientService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/FormField';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { formatDate } from '../utils/format';

export default function Patients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: patients, loading, error, refetch } = useFetch(() => getPatients(search), [search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or patient ID"
            className="pl-10"
          />
        </div>
        <Button icon={UserPlus} onClick={() => navigate('/patients/register')}>
          Register Patient
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? 'No matching patients' : 'No patients registered yet'}
            description={
              search
                ? 'Try a different name or patient ID.'
                : 'Register your first patient to see them listed here.'
            }
            action={
              !search && (
                <Button size="sm" icon={UserPlus} onClick={() => navigate('/patients/register')}>
                  Register Patient
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-xs text-slate-400">
                  <th className="px-5 py-3 font-medium">Patient ID</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Age</th>
                  <th className="px-5 py-3 font-medium">Gender</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Registered On</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-brand-700">{p.patientId}</td>
                    <td className="px-5 py-3.5 text-slate-700">{p.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.age}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.gender}</td>
                    <td className="px-5 py-3.5 text-slate-600">{p.phone}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
