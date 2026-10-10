export default function Card({ children, className = '', as: Component = 'div', ...rest }) {
  return (
    <Component
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
