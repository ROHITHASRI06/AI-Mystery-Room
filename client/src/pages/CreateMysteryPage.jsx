import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, DifficultyBadge, ErrorNotice, Eyebrow, Icon, PageContainer } from '../components/UI.jsx';
import { caseApi, getApiError } from '../services/api.js';

const difficulties = [
  { id: 'easy', suspects: 3, clues: 5, hints: 2, note: 'A clear trail of evidence' },
  { id: 'medium', suspects: 4, clues: 7, hints: 3, note: 'A few details misdirect' },
  { id: 'hard', suspects: 5, clues: 9, hints: 3, note: 'Every alibi deserves a second look' },
];

const examplePremise = 'A renowned botanist is found unconscious in a locked greenhouse just before the rare night-blooming orchid disappears.';

export default function CreateMysteryPage() {
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedPremise = premise.trim();
    if (!trimmedPremise) {
      setError('Add a story premise before opening the case.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const newCase = await caseApi.createCase({ premise: trimmedPremise, difficulty });
      navigate(`/cases/${newCase.id}`, { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError, 'The case could not be created. Check the server connection and try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer className="max-w-5xl">
      <Link to="/" className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-200"><span aria-hidden="true">←</span> Back to the briefing</Link>
      <div className="grid gap-10 lg:grid-cols-[1fr_290px] lg:gap-14">
        <div>
          <div className="mb-8"><Eyebrow className="mb-3">New investigation / Intake</Eyebrow><h1 className="display-font text-4xl tracking-[-.035em] text-[#f1efe8] sm:text-5xl">Set the scene.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Start with the strange detail that brought you here. Your premise becomes the foundation of a new case.</p></div>

          {error && <div className="mb-6"><ErrorNotice>{error}</ErrorNotice></div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <div className="mb-3 flex items-end justify-between gap-3"><label htmlFor="premise" className="text-sm font-semibold text-slate-200">The premise</label><span className="text-[10px] tabular-nums text-slate-600">{premise.length} / 1000</span></div>
              <textarea id="premise" value={premise} onChange={(event) => setPremise(event.target.value.slice(0, 1000))} rows={6} maxLength={1000} required placeholder="A clockmaker vanished from his locked workshop. The only thing left running was a watch that belonged to his apprentice…" className="w-full resize-y rounded-2xl border border-white/[0.09] bg-[#111920] px-4 py-4 text-sm leading-6 text-slate-200 placeholder:text-slate-700 transition focus:border-amber-200/35 focus:bg-[#141e25]" />
              <div className="mt-3 flex flex-wrap items-center gap-2"><span className="mr-1 text-[10px] uppercase tracking-[.14em] text-slate-600">Need a spark?</span><button type="button" onClick={() => { setPremise(examplePremise); setError(''); }} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1.5 text-[10px] text-slate-400 transition hover:border-amber-200/20 hover:text-amber-100"><Icon name="spark" className="size-3" /> Use a premise idea</button></div>
            </div>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-slate-200">Choose the difficulty</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {difficulties.map((option) => {
                  const selected = difficulty === option.id;
                  return <button key={option.id} type="button" aria-pressed={selected} onClick={() => setDifficulty(option.id)} className={`relative rounded-xl border p-4 text-left transition ${selected ? 'border-amber-200/35 bg-amber-200/[0.055] shadow-[0_0_0_1px_rgba(232,196,117,.06)]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'}`}>
                    {selected && <span className="absolute right-3 top-3 grid size-4 place-items-center rounded-full bg-amber-200 text-[#18201e]"><Icon name="check" className="size-2.5" /></span>}
                    <DifficultyBadge difficulty={option.id} />
                    <p className="mt-4 text-xs font-semibold text-slate-200">{option.suspects} suspects <span className="text-slate-600">·</span> {option.clues} clues</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">{option.note}</p>
                  </button>;
                })}
              </div>
            </fieldset>

            <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-sm text-[11px] leading-5 text-slate-600">Your case is generated privately. The solution stays sealed until you make an accusation.</p>
              <Button type="submit" disabled={loading || !premise.trim()} className="min-w-48">
                {loading ? <><span className="size-3.5 animate-spin rounded-full border-2 border-[#3e392b] border-t-transparent" /> Building your case…</> : <>Generate case <Icon name="arrow" /></>}
              </Button>
            </div>
          </form>
        </div>

        <aside className="space-y-4 lg:pt-14">
          <div className="rounded-2xl border border-white/[0.07] bg-[#111920]/80 p-5">
            <Eyebrow className="mb-3 text-[9px]">Intake protocol</Eyebrow>
            <ol className="space-y-4">{[['01', 'Describe the incident', 'A location, a person, and one detail that does not add up.'], ['02', 'Set the challenge', 'More suspects and evidence make a tougher investigation.'], ['03', 'Review the case', 'Once generated, your case file is ready to examine.']].map(([number, title, detail]) => <li key={number} className="flex gap-3"><span className="font-mono text-[9px] text-amber-200/60">{number}</span><div><p className="text-xs font-semibold text-slate-300">{title}</p><p className="mt-1 text-[10px] leading-5 text-slate-600">{detail}</p></div></li>)}</ol>
          </div>
          <div className="rounded-2xl border border-amber-100/10 bg-amber-100/[0.025] p-5"><p className="display-font text-lg text-amber-100/85">“A good mystery asks the right question.”</p><p className="mt-2 text-[10px] text-slate-600">— Investigator’s handbook</p></div>
        </aside>
      </div>
    </PageContainer>
  );
}
