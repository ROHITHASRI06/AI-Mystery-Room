import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorNotice, Eyebrow, Icon, LinkButton, LoadingState, PageContainer, Panel, PanelTitle } from '../components/UI.jsx';
import { caseApi, getApiError } from '../services/api.js';

export default function ResultsPage() {
  const { caseId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notCompleted, setNotCompleted] = useState(false);

  useEffect(() => {
    let current = true;
    caseApi.getResult(caseId)
      .then((data) => { if (current) setResult(data); })
      .catch((requestError) => {
        if (!current) return;
        setError(getApiError(requestError, 'The result could not be loaded.'));
        setNotCompleted(requestError?.response?.status === 409);
      })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [caseId]);

  if (loading) return <PageContainer><LoadingState label="Opening the final report…" /></PageContainer>;
  if (error) return <PageContainer><div className="mx-auto max-w-2xl rounded-2xl border border-white/[0.08] bg-[#131b22] p-6 sm:p-8"><Eyebrow className="mb-3">{notCompleted ? 'No verdict yet' : 'Report unavailable'}</Eyebrow><h1 className="display-font text-3xl text-[#f1efe8]">{notCompleted ? 'The case is still open.' : 'We could not open this report.'}</h1><p className="mt-3 text-sm leading-6 text-slate-400">{notCompleted ? 'Submit your final accusation before viewing the solution.' : 'We could not retrieve the completed case report.'}</p>{!notCompleted && <div className="mt-5"><ErrorNotice>{error}</ErrorNotice></div>}<Link to={`/cases/${caseId}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-amber-100">Return to the investigation <Icon name="arrow" /></Link></div></PageContainer>;
  if (!result) return null;

  const correct = result.isCorrect;

  return (
    <PageContainer className="max-w-5xl">
      <div className="mx-auto max-w-4xl">
        <div className={`relative overflow-hidden rounded-[26px] border p-6 sm:p-10 ${correct ? 'border-emerald-200/20 bg-[linear-gradient(135deg,rgba(18,48,41,.75),rgba(18,27,31,.9))]' : 'border-rose-200/15 bg-[linear-gradient(135deg,rgba(50,28,31,.72),rgba(20,26,31,.92))]'}`}>
          <div aria-hidden="true" className="absolute -right-20 -top-28 size-72 rounded-full border border-white/[0.04]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div><Eyebrow className={correct ? 'text-emerald-200/70' : 'text-rose-200/70'}>Investigation complete / Final report</Eyebrow><h1 className="display-font mt-3 text-4xl leading-tight tracking-[-.035em] text-[#f1efe8] sm:text-5xl">{correct ? 'Your read was right.' : 'The trail went cold.'}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300/75">{correct ? 'You connected the evidence and identified the culprit.' : 'The evidence points to someone else. The complete case file is now unsealed.'}</p></div>
            <div className={`grid size-16 shrink-0 place-items-center self-start rounded-2xl border ${correct ? 'border-emerald-200/20 bg-emerald-200/[0.07] text-emerald-100' : 'border-rose-200/15 bg-rose-200/[0.06] text-rose-100'}`}><span className="display-font text-3xl">{correct ? '✓' : '×'}</span></div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.07] bg-[#131b22] p-4"><Eyebrow className="text-[8px]">Your accusation</Eyebrow><p className="mt-2 text-sm font-semibold text-slate-200">{result.accusedSuspect}</p><p className="mt-1 text-[10px] text-slate-600">{result.isCorrect ? 'Correct suspect' : 'Not the culprit'}</p></div>
          <div className="rounded-xl border border-amber-100/10 bg-amber-100/[0.035] p-4"><Eyebrow className="text-[8px]">Actual culprit</Eyebrow><p className="mt-2 text-sm font-semibold text-amber-100">{result.culprit}</p><p className="mt-1 text-[10px] text-slate-600">{result.culpritId}</p></div>
          <div className="rounded-xl border border-white/[0.07] bg-[#131b22] p-4"><Eyebrow className="text-[8px]">Final score</Eyebrow><p className="display-font mt-1 text-3xl text-[#f1efe8]">{result.finalScore}<span className="ml-1 text-xs text-slate-600">pts</span></p><p className="mt-1 text-[10px] text-slate-600">Calculated from your investigation</p></div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_280px]">
          <Panel>
            <PanelTitle eyebrow="Sealed solution" title={result.caseTitle} />
            <div className="space-y-6 p-5 sm:p-6">
              <div><Eyebrow className="mb-2 text-[9px]">What happened</Eyebrow><p className="text-sm leading-7 text-slate-300">{result.solutionExplanation}</p><p className="mt-3 text-xs leading-6 text-slate-400">{result.finalSolution}</p></div>
              <div className="border-t border-white/[0.06] pt-5"><Eyebrow className="mb-2 text-[9px]">The reasoning</Eyebrow><p className="text-xs leading-6 text-slate-400">{result.reasoning}</p></div>
              <div className="border-t border-white/[0.06] pt-5"><Eyebrow className="mb-3 text-[9px]">How the evidence connects</Eyebrow><ol className="space-y-2.5">{result.clueConnections.map((connection) => <li key={connection.clueId} className="flex gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3"><span className="mt-0.5 shrink-0 font-mono text-[9px] text-amber-200/70">{connection.clueId}</span><span className="text-xs leading-5 text-slate-400">{connection.explanation}</span></li>)}</ol></div>
            </div>
          </Panel>
          <aside className="space-y-4">
            <Panel className="p-5"><Eyebrow className="mb-4 text-[9px]">Investigation record</Eyebrow><div className="space-y-4"><div className="flex items-center justify-between border-b border-white/[0.06] pb-3"><span className="text-xs text-slate-500">Evidence discovered</span><span className="text-sm font-semibold text-slate-200">{result.discoveredClueCount}</span></div><div className="flex items-center justify-between border-b border-white/[0.06] pb-3"><span className="text-xs text-slate-500">Hints used</span><span className="text-sm font-semibold text-slate-200">{result.hintsUsed}</span></div><div className="flex items-center justify-between"><span className="text-xs text-slate-500">Verdict</span><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] ${correct ? 'border-emerald-200/20 text-emerald-200' : 'border-rose-200/20 text-rose-200'}`}>{correct ? 'Correct' : 'Incorrect'}</span></div></div></Panel>
            <LinkButton to="/create" className="w-full">Start another case <Icon name="arrow" /></LinkButton>
            <Link to={`/cases/${caseId}`} className="block py-2 text-center text-xs text-slate-500 transition hover:text-slate-300">Back to case overview</Link>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
