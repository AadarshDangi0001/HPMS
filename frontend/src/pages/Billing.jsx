import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Receipt, PlusCircle } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getPatients } from '../services/patientService';
import { getBills, createBill, markBillPaid } from '../services/billService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Label, Input, Select, FieldError } from '../components/ui/FormField';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { paymentStatusStyles } from '../utils/statusStyles';
import { formatCurrency, formatDate } from '../utils/format';
import { getErrorMessage } from '../services/api';

const initialForm = {
  patient: '',
  consultationCharges: '',
  roomCharges: '',
  laboratoryCharges: '',
  medicationCharges: '',
};

export default function Billing() {
  const { data: patients } = useFetch(() => getPatients(), []);
  const { data: bills, loading, error, refetch } = useFetch(getBills, []);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const total = useMemo(
    () =>
      ['consultationCharges', 'roomCharges', 'laboratoryCharges', 'medicationCharges'].reduce(
        (sum, key) => sum + (Number(form[key]) || 0),
        0
      ),
    [form]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.patient) errs.patient = 'Please select a patient';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await createBill({
        patient: form.patient,
        consultationCharges: Number(form.consultationCharges) || 0,
        roomCharges: Number(form.roomCharges) || 0,
        laboratoryCharges: Number(form.laboratoryCharges) || 0,
        medicationCharges: Number(form.medicationCharges) || 0,
      });
      toast.success('Bill created successfully');
      setForm(initialForm);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id) => {
    setPayingId(id);
    try {
      await markBillPaid(id);
      toast.success('Bill marked as paid');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Receipt size={20} />
          </div>
          <h2 className="font-semibold text-slate-800">Create Bill</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-4">
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
            <Label>Consultation Charges</Label>
            <Input type="number" min="0" name="consultationCharges" value={form.consultationCharges} onChange={handleChange} placeholder="0" />
          </div>
          <div>
            <Label>Room Charges</Label>
            <Input type="number" min="0" name="roomCharges" value={form.roomCharges} onChange={handleChange} placeholder="0" />
          </div>
          <div>
            <Label>Laboratory Charges</Label>
            <Input type="number" min="0" name="laboratoryCharges" value={form.laboratoryCharges} onChange={handleChange} placeholder="0" />
          </div>
          <div>
            <Label>Medication Charges</Label>
            <Input type="number" min="0" name="medicationCharges" value={form.medicationCharges} onChange={handleChange} placeholder="0" />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3.5">
            <span className="text-sm font-medium text-slate-500">Total Amount</span>
            <span className="text-lg font-bold text-slate-800">{formatCurrency(total)}</span>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <Button type="submit" loading={submitting} icon={PlusCircle}>
              Create Bill
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : bills.length === 0 ? (
          <EmptyState icon={Receipt} title="No bills created yet" description="Create a bill above to see it listed here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-xs text-slate-400">
                  <th className="px-5 py-3 font-medium">Bill ID</th>
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Consultation</th>
                  <th className="px-5 py-3 font-medium">Room</th>
                  <th className="px-5 py-3 font-medium">Lab</th>
                  <th className="px-5 py-3 font-medium">Medication</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-brand-700">{bill.billId}</td>
                    <td className="px-5 py-3.5 text-slate-700">{bill.patient?.name || 'Unknown'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{formatCurrency(bill.consultationCharges)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{formatCurrency(bill.roomCharges)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{formatCurrency(bill.laboratoryCharges)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{formatCurrency(bill.medicationCharges)}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{formatCurrency(bill.totalAmount)}</td>
                    <td className="px-5 py-3.5">
                      <Badge className={paymentStatusStyles[bill.paymentStatus]}>{bill.paymentStatus}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(bill.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      {bill.paymentStatus === 'Unpaid' ? (
                        <Button size="sm" variant="success" loading={payingId === bill._id} onClick={() => handleMarkPaid(bill._id)}>
                          Mark Paid
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">Settled</span>
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
  );
}
