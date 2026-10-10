import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarClock, CalendarPlus } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getPatients } from '../services/patientService';
import { getDoctors } from '../services/doctorService';
import { getAppointments, createAppointment, updateAppointmentStatus } from '../services/appointmentService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Label, Input, Select, Textarea, FieldError } from '../components/ui/FormField';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { appointmentStatusStyles } from '../utils/statusStyles';
import { formatDate, formatTime12h, todayDateString } from '../utils/format';
import { getErrorMessage } from '../services/api';

const filters = ['All', 'Confirmed', 'Pending', 'Cancelled', 'Completed'];

const initialForm = { patient: '', doctor: '', date: '', time: '', reason: '' };

export default function Appointments() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);

  const { data: patients } = useFetch(() => getPatients(), []);
  const { data: doctors } = useFetch(() => getDoctors(true), []);
  const {
    data: appointments,
    loading,
    error,
    refetch,
  } = useFetch(() => getAppointments(statusFilter), [statusFilter]);

  const selectedDoctor = useMemo(
    () => doctors?.find((d) => d._id === form.doctor),
    [doctors, form.doctor]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.patient) errs.patient = 'Please select a patient';
    if (!form.doctor) errs.doctor = 'Please select a doctor';
    if (!form.date) errs.date = 'Please choose a date';
    else if (form.date < todayDateString()) errs.date = 'Date cannot be in the past';
    if (!form.time) errs.time = 'Please choose a time';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await createAppointment({
        patient: form.patient,
        doctor: form.doctor,
        department: selectedDoctor?.department || '',
        date: form.date,
        time: form.time,
        reason: form.reason,
      });
      const apt = res.data.data;
      toast.success(`Appointment ${apt.appointmentId} confirmed successfully`);
      setForm(initialForm);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionId(id);
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Appointment marked as ${status}`);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CalendarPlus size={20} />
          </div>
          <h2 className="font-semibold text-slate-800">Book Appointment</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label required>Patient</Label>
            <Select name="patient" value={form.patient} onChange={handleChange} error={errors.patient}>
              <option value="">Select patient</option>
              {patients?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.patientId})
                </option>
              ))}
            </Select>
            <FieldError>{errors.patient}</FieldError>
          </div>

          <div>
            <Label required>Doctor</Label>
            <Select name="doctor" value={form.doctor} onChange={handleChange} error={errors.doctor}>
              <option value="">Select doctor</option>
              {doctors?.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} — {d.department}
                </option>
              ))}
            </Select>
            <FieldError>{errors.doctor}</FieldError>
          </div>

          <div>
            <Label>Department</Label>
            <Input value={selectedDoctor?.department || ''} disabled placeholder="Auto-filled from doctor" />
          </div>

          <div>
            <Label required>Appointment Date</Label>
            <Input type="date" name="date" min={todayDateString()} value={form.date} onChange={handleChange} error={errors.date} />
            <FieldError>{errors.date}</FieldError>
          </div>

          <div>
            <Label required>Appointment Time</Label>
            <Input type="time" name="time" value={form.time} onChange={handleChange} error={errors.time} />
            <FieldError>{errors.time}</FieldError>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <Label>Reason for Appointment</Label>
            <Textarea name="reason" rows={1} value={form.reason} onChange={handleChange} placeholder="optional" />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <Button type="submit" loading={submitting} icon={CalendarPlus}>
              Book Appointment
            </Button>
          </div>
        </form>
      </Card>

      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <Spinner />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : appointments.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No appointments found" description="Try a different filter or book a new appointment." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-xs text-slate-400">
                    <th className="px-5 py-3 font-medium">Appointment ID</th>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Doctor</th>
                    <th className="px-5 py-3 font-medium">Department</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Time</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-medium text-brand-700">{apt.appointmentId}</td>
                      <td className="px-5 py-3.5 text-slate-700">{apt.patient?.name || 'Unknown'}</td>
                      <td className="px-5 py-3.5 text-slate-600">{apt.doctor?.name || 'Unknown'}</td>
                      <td className="px-5 py-3.5 text-slate-600">{apt.department}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatDate(apt.date)}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatTime12h(apt.time)}</td>
                      <td className="px-5 py-3.5">
                        <Badge className={appointmentStatusStyles[apt.status]}>{apt.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {apt.status === 'Confirmed' || apt.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              loading={actionId === apt._id}
                              onClick={() => handleStatusChange(apt._id, 'Completed')}
                            >
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              loading={actionId === apt._id}
                              onClick={() => handleStatusChange(apt._id, 'Cancelled')}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
