import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, UserPlus } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Label, Input, Select, Textarea, FieldError } from '../components/ui/FormField';
import { createPatient } from '../services/patientService';
import { getErrorMessage } from '../services/api';

const initialForm = {
  name: '',
  age: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  bloodGroup: '',
  symptoms: '',
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Full name is required';
  if (!form.age) errors.age = 'Age is required';
  else if (Number(form.age) < 0 || Number(form.age) > 150) errors.age = 'Enter a valid age';
  if (!form.gender) errors.gender = 'Gender is required';
  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  else if (form.phone.trim().length < 7) errors.phone = 'Enter a valid phone number';
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email';
  if (!form.symptoms.trim()) errors.symptoms = 'Please describe the reason for visit';
  return errors;
}

export default function PatientRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await createPatient({ ...form, age: Number(form.age) });
      setRegistered(res.data.data);
      toast.success('Patient registered successfully');
      setForm(initialForm);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (registered) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={28} />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Patient Registered</h2>
        <p className="mt-1 text-sm text-slate-500">The patient has been added to the system successfully.</p>
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-400">Patient ID</p>
          <p className="text-xl font-bold tracking-wide text-brand-700">{registered.patientId}</p>
          <p className="mt-1 text-sm text-slate-600">{registered.name}</p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => setRegistered(null)}>
            Register Another
          </Button>
          <Button onClick={() => navigate('/patients')}>View Patients</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <UserPlus size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800">New Patient Registration</h2>
          <p className="text-sm text-slate-400">Fields marked with * are required</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label required>Full Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rahul Sharma" error={errors.name} />
            <FieldError>{errors.name}</FieldError>
          </div>
          <div>
            <Label required>Age</Label>
            <Input type="number" name="age" value={form.age} onChange={handleChange} placeholder="e.g. 32" error={errors.age} />
            <FieldError>{errors.age}</FieldError>
          </div>
          <div>
            <Label required>Gender</Label>
            <Select name="gender" value={form.gender} onChange={handleChange} error={errors.gender}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>
            <FieldError>{errors.gender}</FieldError>
          </div>
          <div>
            <Label required>Phone Number</Label>
            <Input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 9876543210" error={errors.phone} />
            <FieldError>{errors.phone}</FieldError>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="optional" error={errors.email} />
            <FieldError>{errors.email}</FieldError>
          </div>
          <div>
            <Label>Blood Group</Label>
            <Select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
              <option value="">Not known</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label>Address</Label>
          <Input name="address" value={form.address} onChange={handleChange} placeholder="optional" />
        </div>

        <div>
          <Label required>Symptoms / Reason for Visit</Label>
          <Textarea
            name="symptoms"
            value={form.symptoms}
            onChange={handleChange}
            rows={3}
            placeholder="Briefly describe the reason for the visit"
            error={errors.symptoms}
          />
          <FieldError>{errors.symptoms}</FieldError>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" loading={submitting}>
            Register Patient
          </Button>
        </div>
      </form>
    </Card>
  );
}
