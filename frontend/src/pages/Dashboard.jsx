import { useNavigate } from 'react-router-dom';
import { Users, CalendarClock, BedSingle, BedDouble, UserPlus, CalendarPlus } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import useFetch from '../hooks/useFetch';
import { getDashboardStats } from '../services/dashboardService';
import StatCard from '../components/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { appointmentStatusStyles, chartColors } from '../utils/statusStyles';
import { formatDate, formatTime12h } from '../utils/format';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useFetch(getDashboardStats, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const chartData = Object.entries(data.appointmentStatusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: status, value: count }));

  const totalBeds = data.availableBeds + data.occupiedBeds + data.maintenanceBeds;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Patients" value={data.totalPatients} icon={Users} tone="brand" />
        <StatCard label="Total Appointments" value={data.totalAppointments} icon={CalendarClock} tone="teal" />
        <StatCard label="Available Beds" value={data.availableBeds} icon={BedSingle} tone="emerald" />
        <StatCard label="Occupied Beds" value={data.occupiedBeds} icon={BedDouble} tone="amber" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button icon={UserPlus} onClick={() => navigate('/patients/register')}>
          Register Patient
        </Button>
        <Button variant="secondary" icon={CalendarPlus} onClick={() => navigate('/appointments')}>
          Book Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Recent Appointments</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
              View all
            </Button>
          </div>
          {data.recentAppointments.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No appointments yet" description="Booked appointments will show up here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400">
                    <th className="pb-2.5 font-medium">Patient</th>
                    <th className="pb-2.5 font-medium">Doctor</th>
                    <th className="pb-2.5 font-medium">Date & Time</th>
                    <th className="pb-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAppointments.map((apt) => (
                    <tr key={apt._id} className="border-b border-slate-50 last:border-0">
                      <td className="py-3">
                        <p className="font-medium text-slate-700">{apt.patient?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{apt.patient?.patientId}</p>
                      </td>
                      <td className="py-3 text-slate-600">{apt.doctor?.name || 'Unknown'}</td>
                      <td className="py-3 text-slate-600">
                        {formatDate(apt.date)} · {formatTime12h(apt.time)}
                      </td>
                      <td className="py-3">
                        <Badge className={appointmentStatusStyles[apt.status]}>{apt.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-2 font-semibold text-slate-800">Appointment Status</h2>
          {chartData.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No data to display</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={chartColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-semibold text-slate-800">Bed Occupancy Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Available', value: data.availableBeds, color: 'bg-emerald-500' },
            { label: 'Occupied', value: data.occupiedBeds, color: 'bg-rose-500' },
            { label: 'Maintenance', value: data.maintenanceBeds, color: 'bg-slate-400' },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className={`h-2 w-2 rounded-full ${row.color}`} />
                  {row.label}
                </span>
                <span className="font-semibold text-slate-700">{row.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full ${row.color}`}
                  style={{ width: totalBeds ? `${(row.value / totalBeds) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
