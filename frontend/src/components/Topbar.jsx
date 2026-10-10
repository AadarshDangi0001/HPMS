import { Menu, Bell, ChevronRight } from 'lucide-react';

export default function Topbar({ title, breadcrumb, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>HPMS</span>
            <ChevronRight size={12} />
            <span className="text-slate-500">{breadcrumb || title}</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100">
          <Bell size={19} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-semibold text-white">
            A
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium text-slate-700">Admin</p>
            <p className="text-[11px] text-slate-400">Front Desk</p>
          </div>
        </div>
      </div>
    </header>
  );
}
