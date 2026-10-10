export function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

const fieldBase =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30';

export function Input({ error, className = '', ...rest }) {
  return (
    <input
      className={`${fieldBase} ${error ? 'border-rose-300' : 'border-slate-200 focus:border-brand-500'} ${className}`}
      {...rest}
    />
  );
}

export function Select({ error, className = '', children, ...rest }) {
  return (
    <select
      className={`${fieldBase} ${error ? 'border-rose-300' : 'border-slate-200 focus:border-brand-500'} ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Textarea({ error, className = '', ...rest }) {
  return (
    <textarea
      className={`${fieldBase} resize-none ${error ? 'border-rose-300' : 'border-slate-200 focus:border-brand-500'} ${className}`}
      {...rest}
    />
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs font-medium text-rose-500">{children}</p>;
}
