import { Link, useLocation } from 'react-router-dom';

function BrandMark() {
  return (
    <span className="relative grid size-10 place-items-center rounded-xl border border-amber-300/25 bg-amber-300/[0.07] text-amber-300">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5">
        <path d="M4 20V9.5a8 8 0 0 1 16 0V20" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 20v-7a4 4 0 0 1 8 0v7M12 14v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="absolute -right-1 -top-1 size-2 rounded-full bg-amber-300" />
    </span>
  );
}

export default function AppShell({ children }) {
  const location = useLocation();
  const isCaseRoute = location.pathname.startsWith('/cases/');

  return (
    <div className="min-h-screen text-[#e8e6df]">
      <header className="border-b border-white/[0.07] bg-[#0b1117]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link className="flex items-center gap-3" to="/" aria-label="AI Mystery Room home">
            <BrandMark />
            <span>
              <span className="block text-sm font-semibold tracking-wide text-[#f1efe8]">AI Mystery Room</span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.27em] text-slate-500">The investigator’s desk</span>
            </span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-5">
            {!isCaseRoute && <a className="hidden text-sm text-slate-400 transition hover:text-white sm:block" href="/#how-it-works">How it works</a>}
            <Link className="group inline-flex items-center gap-2 rounded-lg border border-amber-300/25 bg-amber-300/[0.07] px-3.5 py-2 text-xs font-semibold text-amber-200 transition hover:border-amber-200/50 hover:bg-amber-300/[0.12] sm:px-4 sm:text-sm" to="/create">
              <span>{isCaseRoute ? 'New case' : 'Start investigating'}</span>
              <span aria-hidden="true" className="transition group-hover:translate-x-0.5">↗</span>
            </Link>
          </nav>
        </div>
      </header>

      <div className="min-h-[calc(100vh-145px)]">{children}</div>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>AI Mystery Room <span className="text-slate-700">/</span> Every detail has a story.</span>
          <span>Think carefully. The truth is in the evidence.</span>
        </div>
      </footer>
    </div>
  );
}
