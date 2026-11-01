import { Link } from 'react-router-dom';

const buttonStyles = {
  primary: 'border border-amber-200/50 bg-amber-300 text-[#171813] shadow-[0_8px_30px_rgba(206,158,68,.12)] hover:bg-amber-200',
  secondary: 'border border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/20 hover:bg-white/[0.08]',
  danger: 'border border-rose-300/25 bg-rose-400/[0.09] text-rose-200 hover:bg-rose-400/[0.15]',
  quiet: 'border border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white',
};

export function Button({ variant = 'primary', className = '', ...props }) {
  return <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles[variant]} ${className}`} {...props} />;
}

export function LinkButton({ to, variant = 'primary', className = '', children, ...props }) {
  return <Link to={to} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${buttonStyles[variant]} ${className}`} {...props}>{children}</Link>;
}

export function PageContainer({ children, className = '' }) {
  return <main className={`mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12 ${className}`}>{children}</main>;
}

export function Eyebrow({ children, className = '' }) {
  return <p className={`text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300/80 ${className}`}>{children}</p>;
}

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-5 border-b border-white/[0.07] pb-7 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h1 className="display-font text-4xl leading-[1.04] tracking-[-0.035em] text-[#f1efe8] sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = '', ...props }) {
  return <section className={`rounded-2xl border border-white/[0.08] bg-[#131b22]/85 shadow-[0_14px_46px_rgba(0,0,0,.14)] ${className}`} {...props}>{children}</section>;
}

export function PanelTitle({ eyebrow, title, aside }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-6">
      <div>{eyebrow && <Eyebrow className="mb-1.5 text-[9px]">{eyebrow}</Eyebrow>}<h2 className="text-base font-semibold text-[#eae8e1]">{title}</h2></div>
      {aside}
    </div>
  );
}

export function ErrorNotice({ children, onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-rose-300/20 bg-rose-400/[0.07] p-4 text-sm text-rose-100">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-rose-300/10 font-bold text-rose-200">!</span>
        <div className="flex-1"><p>{children}</p>{onRetry && <button type="button" className="mt-2 text-xs font-semibold text-rose-200 underline decoration-rose-200/40 underline-offset-4 hover:text-white" onClick={onRetry}>Try again</button>}</div>
      </div>
    </div>
  );
}

export function LoadingState({ label = 'Opening the case file…' }) {
  return (
    <div role="status" className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 text-center">
      <span className="relative mb-5 grid size-12 place-items-center rounded-full border border-amber-300/25 text-amber-200">
        <span className="absolute inset-1 rounded-full border border-amber-200/20 border-t-amber-200 pulse-soft" />
        <span className="size-1.5 rounded-full bg-amber-200" />
      </span>
      <p className="text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-1 text-xs text-slate-600">The details are being checked.</p>
    </div>
  );
}

export function DifficultyBadge({ difficulty }) {
  const styles = {
    easy: 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200',
    medium: 'border-sky-300/20 bg-sky-300/[0.08] text-sky-200',
    hard: 'border-amber-300/25 bg-amber-300/[0.08] text-amber-200',
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] ${styles[difficulty] || styles.medium}`}><span className="size-1 rounded-full bg-current" />{difficulty}</span>;
}

export function ProgressBar({ value, max, label }) {
  const percent = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-400">{label}</span><span className="font-semibold tabular-nums text-slate-200">{value}<span className="text-slate-600"> / {max}</span></span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-200 transition-all duration-500" style={{ width: `${percent}%` }} /></div>
    </div>
  );
}

export function Icon({ name, className = 'size-4' }) {
  const paths = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    eye: <><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    spark: <><path d="m12 3 1.5 6.5L20 12l-6.5 1.5L12 20l-1.5-6.5L4 12l6.5-2.5L12 3Z" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name] || paths.spark}</svg>;
}
