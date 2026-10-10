import { useState } from 'react';
import { toast } from 'sonner';
import { Stethoscope, Plus, Phone, Clock } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getDoctors, createDoctor, updateDoctorAvailability } from '../services/doctorService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Label, Input, FieldError } from '../components/ui/FormField';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { formatTime12h } from '../utils/format';
import { getErrorMessage } from '../services/api';

const initialForm = {
  name: '',
  specialization: '',
  department: '',
  phone: '',
  consultationStart: '',
  consultationEnd: '',
};

export default function Doctors() {
  const { data: doctors, loading, error, refetch } = useFetch(() => getDoctors(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toggleId, setToggleId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Doctor name is required';
    if (!form.specialization.trim()) errs.specialization = 'Specialization is required';
    if (!form.department.trim()) errs.department = 'Department is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.consultationStart) errs.consultationStart = 'Required';
    if (!form.consultationEnd) errs.consultationEnd = 'Required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await createDoctor(form);
      toast.success('Doctor added successfully');
      setForm(initialForm);
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (doctor) => {
    setToggleId(doctor._id);
    try {
      await updateDoctorAvailability(doctor._id, !doctor.isAvailable);
      toast.success(`Dr. ${doctor.name.replace('Dr. ', '')} marked as ${!doctor.isAvailable ? 'available' : 'unavailable'}`);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggleId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          Add Doctor
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : doctors.length === 0 ? (
        <Card>
          <EmptyState icon={Stethoscope} title="No doctors added yet" description="Add a doctor to start booking appointments." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => (
            <Card key={doc._id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{doc.name}</p>
                    <p className="text-xs text-slate-400">{doc.specialization}</p>
                  </div>
                </div>
                <Badge
                  className={
                    doc.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                  }
                >
                  {doc.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                <p className="font-medium text-slate-600">{doc.department}</p>
                <p className="flex items-center gap-1.5">
                  <Clock size={14} /> {formatTime12h(doc.consultationStart)} – {formatTime12h(doc.consultationEnd)}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone size={14} /> {doc.phone}
                </p>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <Button
                  size="sm"
                  variant={doc.isAvailable ? 'secondary' : 'success'}
                  className="w-full"
                  loading={toggleId === doc._id}
                  onClick={() => handleToggle(doc)}
                >
                  {doc.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Doctor">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label required>Doctor Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Dr. Ananya Gupta" error={errors.name} />
            <FieldError>{errors.name}</FieldError>
          </div>
          <div>
            <Label required>Specialization</Label>
            <Input name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Cardiologist" error={errors.specialization} />
            <FieldError>{errors.specialization}</FieldError>
          </div>
          <div>
            <Label required>Department</Label>
            <Input name="department" value={form.department} onChange={handleChange} placeholder="e.g. Cardiology" error={errors.department} />
            <FieldError>{errors.department}</FieldError>
          </div>
          <div>
            <Label required>Phone</Label>
            <Input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210" error={errors.phone} />
            <FieldError>{errors.phone}</FieldError>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Consultation Start</Label>
              <Input type="time" name="consultationStart" value={form.consultationStart} onChange={handleChange} error={errors.consultationStart} />
              <FieldError>{errors.consultationStart}</FieldError>
            </div>
            <div>
              <Label required>Consultation End</Label>
              <Input type="time" name="consultationEnd" value={form.consultationEnd} onChange={handleChange} error={errors.consultationEnd} />
              <FieldError>{errors.consultationEnd}</FieldError>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Add Doctor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
