import { Icon, Panel, PanelTitle } from './UI.jsx';

export function CaseMeta({ victim, location, timeline = [] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Victim</p>
        <p className="text-sm font-medium text-slate-200">{victim?.name || 'Unknown'}</p>
        <p className="mt-1 text-xs text-slate-500">{[victim?.age, victim?.occupation].filter(Boolean).join(' · ')}</p>
      </div>
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Scene</p>
        <p className="flex items-center gap-2 text-sm font-medium text-slate-200"><Icon name="pin" className="size-3.5 shrink-0 text-amber-300" />{location}</p>
        <p className="mt-1 text-xs text-slate-500">Primary crime location</p>
      </div>
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Case timeline</p>
        <p className="flex items-center gap-2 text-sm font-medium text-slate-200"><Icon name="clock" className="size-3.5 shrink-0 text-amber-300" />{timeline.length} recorded moments</p>
        <p className="mt-1 text-xs text-slate-500">Review below for key events</p>
      </div>
    </div>
  );
}

export function SuspectCard({ suspect, index }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#172129]/70 p-4 transition hover:border-amber-200/20 sm:p-5">
      <div className="absolute right-4 top-4 font-mono text-[10px] tracking-widest text-slate-600">S-{String(index + 1).padStart(2, '0')}</div>
      <div className="mb-4 flex items-start gap-3 pr-8">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-amber-200">{suspect.name?.slice(0, 1)?.toUpperCase() || '?'}</span>
        <div className="min-w-0"><h3 className="font-semibold text-[#eeece5]">{suspect.name}</h3><p className="mt-1 text-xs text-slate-500">{suspect.age} · {suspect.occupation}</p></div>
      </div>
      <p className="text-xs leading-5 text-slate-400">{suspect.description}</p>
      <dl className="mt-4 space-y-3 border-t border-white/[0.06] pt-4 text-xs">
        <div><dt className="mb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">Connection</dt><dd className="leading-5 text-slate-300">{suspect.relationshipWithVictim}</dd></div>
        <div><dt className="mb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">Possible motive</dt><dd className="leading-5 text-slate-300">{suspect.motive}</dd></div>
        <div><dt className="mb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">Alibi</dt><dd className="leading-5 text-slate-300">{suspect.alibi}</dd></div>
      </dl>
      <blockquote className="mt-4 border-l border-amber-300/35 pl-3 text-xs italic leading-5 text-slate-400">“{suspect.statement}”</blockquote>
    </article>
  );
}

export function ClueCard({ clue, onDiscover, busy, locked }) {
  return (
    <button
      type="button"
      onClick={() => !clue.discovered && onDiscover(clue.clueId)}
      disabled={busy || locked || clue.discovered}
      aria-label={clue.discovered ? `${clue.title}, discovered` : `Discover ${clue.title}`}
      className={`group w-full rounded-xl border p-4 text-left transition sm:p-5 ${clue.discovered ? 'border-emerald-300/15 bg-emerald-300/[0.035]' : 'border-white/[0.08] bg-[#172129]/60 hover:-translate-y-0.5 hover:border-amber-200/25 hover:bg-[#1a252d]'}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3"><span className={`grid size-9 place-items-center rounded-lg border ${clue.discovered ? 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200' : 'border-white/[0.08] bg-white/[0.035] text-amber-200/80'}`}><Icon name={clue.discovered ? 'check' : 'eye'} /></span><span className="font-semibold text-slate-200">{clue.title}</span></div>
        <span className={`mt-1 size-2 rounded-full ${clue.discovered ? 'bg-emerald-300' : 'bg-amber-300/45 group-hover:bg-amber-200'}`} />
      </div>
      <p className="min-h-10 text-xs leading-5 text-slate-400">{clue.discovered ? clue.description : 'The details are sealed. Examine this evidence to add it to your case notes.'}</p>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.17em] text-slate-600">{clue.category}</span>
        <span className={`text-[10px] font-semibold ${clue.discovered ? 'text-emerald-200/75' : 'text-amber-200/75'}`}>{clue.discovered ? 'Logged' : locked ? 'Case closed' : busy ? 'Examining…' : 'Examine →'}</span>
      </div>
      {clue.discovered && clue.relevance && <p className="mt-3 border-t border-white/[0.05] pt-3 text-xs leading-5 text-slate-500"><span className="text-slate-400">Relevance:</span> {clue.relevance}</p>}
    </button>
  );
}

export function TimelinePanel({ timeline = [] }) {
  return (
    <Panel>
      <PanelTitle eyebrow="Sequence of events" title="Timeline" aside={<Icon name="clock" className="mt-1 size-4 text-slate-600" />} />
      <ol className="space-y-0 px-5 py-2 sm:px-6">
        {timeline.map((entry, index) => (
          <li key={`${entry.time}-${index}`} className="relative flex gap-4 py-3.5 last:pb-4">
            {index !== timeline.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[4px] top-7 w-px bg-white/[0.08]" />}
            <span className="relative mt-1 size-[9px] shrink-0 rounded-full border border-amber-200/45 bg-[#131b22]" />
            <div className="min-w-0"><p className="font-mono text-[10px] font-semibold tracking-wide text-amber-200/75">{entry.time}</p><p className="mt-1 text-xs leading-5 text-slate-300">{entry.event}</p></div>
          </li>
        ))}
      </ol>
      {timeline.length === 0 && <p className="px-6 py-5 text-xs text-slate-500">No timeline entries have been recorded.</p>}
    </Panel>
  );
}

export function HintsPanel({ hints, remaining, onRequest, busy, locked }) {
  return (
    <Panel>
      <PanelTitle eyebrow="Guidance" title="Field notes" aside={<span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] text-slate-400">{remaining} remaining</span>} />
      <div className="space-y-3 p-5 sm:p-6">
        {hints.length === 0 && <p className="rounded-xl border border-dashed border-white/[0.09] px-4 py-5 text-center text-xs leading-5 text-slate-500">No notes requested yet. Ask for a hint if you need a nudge.</p>}
        {hints.map((hint, index) => <div key={hint.hintId} className="flex gap-3 rounded-xl border border-amber-200/10 bg-amber-200/[0.035] p-3.5"><span className="grid size-6 shrink-0 place-items-center rounded-full border border-amber-200/20 text-[10px] font-semibold text-amber-200">{index + 1}</span><p className="pt-0.5 text-xs leading-5 text-slate-300">{hint.text}</p></div>)}
        <button type="button" onClick={onRequest} disabled={busy || locked || remaining <= 0} className="w-full rounded-xl border border-amber-200/20 bg-amber-200/[0.06] px-4 py-3 text-xs font-semibold text-amber-100 transition hover:border-amber-200/35 hover:bg-amber-200/[0.1] disabled:cursor-not-allowed disabled:opacity-45">
          {locked ? 'Case completed' : remaining <= 0 ? 'No hints remaining' : busy ? 'Reviewing notes…' : 'Request a hint'}
        </button>
      </div>
    </Panel>
  );
}
