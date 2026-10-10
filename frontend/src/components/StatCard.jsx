import Card from './ui/Card';

const tones = {
  brand: 'bg-brand-50 text-brand-600',
  teal: 'bg-teal-50 text-teal-accent',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
};

export default function StatCard({ label, value, icon: Icon, tone = 'brand', hint }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}
