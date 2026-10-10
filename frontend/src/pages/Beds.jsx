import { useState } from 'react';
import { toast } from 'sonner';
import { BedDouble, BedSingle, Wrench, Settings2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getBeds, updateBedStatus } from '../services/bedService';
import { getPatients } from '../services/patientService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Label, Select } from '../components/ui/FormField';
import Spinner from '../components/ui/Spinner';
import ErrorState from '../components/ui/ErrorState';
import { bedStatusStyles, bedDotColor } from '../utils/statusStyles';
import { getErrorMessage } from '../services/api';

export default function Beds() {
  const { data: beds, loading, error, refetch } = useFetch(getBeds, []);
  const { data: patients } = useFetch(() => getPatients(), []);
  const [activeBed, setActiveBed] = useState(null);
  const [status, setStatus] = useState('Available');
  const [patientId, setPatientId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openModal = (bed) => {
    setActiveBed(bed);
    setStatus(bed.status);
    setPatientId(bed.patient?._id || '');
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await updateBedStatus(activeBed._id, status, status === 'Occupied' ? patientId : undefined);
      toast.success(`Bed ${activeBed.bedNumber} updated to ${status}`);
      setActiveBed(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const counts = beds.reduce(
    (acc, b) => ({ ...acc, [b.status]: (acc[b.status] || 0) + 1 }),
    { Available: 0, Occupied: 0, Maintenance: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-400">Total Beds</p>
          <p className="mt-1 text-xl font-bold text-slate-800">{beds.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-400">Available</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">{counts.Available}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-400">Occupied</p>
          <p className="mt-1 text-xl font-bold text-rose-600">{counts.Occupied}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-slate-400">Maintenance</p>
          <p className="mt-1 text-xl font-bold text-slate-500">{counts.Maintenance}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {beds.map((bed) => (
          <Card key={bed._id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bedStatusStyles[bed.status]}`}>
                  {bed.status === 'Maintenance' ? <Wrench size={18} /> : bed.status === 'Occupied' ? <BedDouble size={18} /> : <BedSingle size={18} />}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{bed.bedNumber}</p>
                  <p className="text-xs text-slate-400">{bed.wardName}</p>
                </div>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${bedDotColor[bed.status]}`} />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Badge className={bedStatusStyles[bed.status]}>{bed.status}</Badge>
              <span className="text-xs text-slate-400">{bed.wardType}</span>
            </div>

            {bed.patient && <p className="mt-2 truncate text-xs text-slate-500">Patient: {bed.patient.name}</p>}

            <Button variant="secondary" size="sm" icon={Settings2} className="mt-4 w-full" onClick={() => openModal(bed)}>
              Change Status
            </Button>
          </Card>
        ))}
      </div>

      <Modal open={!!activeBed} onClose={() => setActiveBed(null)} title={`Update Bed ${activeBed?.bedNumber || ''}`} maxWidth="max-w-md">
        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </Select>
          </div>
          {status === 'Occupied' && (
            <div>
              <Label>Assign Patient</Label>
              <Select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                <option value="">No patient linked</option>
                {patients?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.patientId})
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setActiveBed(null)}>
              Cancel
            </Button>
            <Button loading={submitting} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
