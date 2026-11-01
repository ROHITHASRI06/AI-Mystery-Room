import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, DifficultyBadge, ErrorNotice, Eyebrow, Icon, LoadingState, PageContainer, PageHeading, Panel, PanelTitle } from '../components/UI.jsx';
import { caseApi, getApiError } from '../services/api.js';

export default function AccusationPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseFile, setCaseFile] = useState(null);
  const [selected, setSelected] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    caseApi.getCase(caseId)
      .then((data) => { if (current) setCaseFile(data); })
      .catch((requestError) => { if (current) setError(getApiError(requestError, 'The case file could not be loaded.')); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [caseId]);

  async function confirmAccusation() {
    if (!selected || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await caseApi.accuse(caseId, selected);
      navigate(`/cases/${caseId}/results`, { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError, 'Your accusation could not be submitted.'));
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <PageContainer><LoadingState label="Reviewing the suspect statements…" /></PageContainer>;
  if (error && !caseFile) return <PageContainer><div className="mx-auto max-w-2xl"><ErrorNotice>{error}</ErrorNotice><Link to={`/cases/${caseId}`} className="mt-5 inline-block text-xs text-amber-200 hover:text-amber-100">Return to the case file →</Link></div></PageContainer>;
  if (!caseFile) return null;
  if (caseFile.status === 'completed') return <PageContainer><div className="mx-auto max-w-2xl rounded-2xl border border-white/[0.08] bg-[#131b22] p-7 text-center"><Eyebrow className="mb-3">Case closed</Eyebrow><h1 className="display-font text-3xl text-[#f1efe8]">An accusation is already on file.</h1><p className="mt-3 text-sm text-slate-400">This case only permits one final accusation.</p><Link to={`/cases/${caseId}/results`} className="mt-6 inline-flex text-sm font-semibold text-amber-200 hover:text-amber-100">Review the verdict →</Link></div></PageContainer>;

  const selectedSuspect = caseFile.suspects.find((suspect) => suspect.suspectId === selected);

  return (
    <PageContainer className="max-w-5xl">
      <Link to={`/cases/${caseId}`} className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-200"><span aria-hidden="true">←</span> Return to investigation</Link>
      <PageHeading eyebrow="Final decision / One accusation allowed" title="Who is your suspect?" description="Weigh the motives, statements, and evidence. Once confirmed, your accusation will close the investigation." action={<DifficultyBadge difficulty={caseFile.difficulty} />} />

      {error && <div className="mb-5"><ErrorNotice>{error}</ErrorNotice></div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Panel>
          <PanelTitle eyebrow="People of interest" title="Select one suspect" aside={<span className="text-[10px] text-slate-500">{caseFile.suspects.length} available</span>} />
          <div role="radiogroup" aria-label="Choose a suspect" className="space-y-3 p-4 sm:p-5">
            {caseFile.suspects.map((suspect, index) => {
              const isSelected = selected === suspect.suspectId;
              return <button key={suspect.suspectId} type="button" role="radio" aria-checked={isSelected} onClick={() => setSelected(suspect.suspectId)} className={`w-full rounded-xl border p-4 text-left transition sm:p-5 ${isSelected ? 'border-amber-200/35 bg-amber-200/[0.055]' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]'}`}>
                <div className="flex items-start gap-4">
                  <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${isSelected ? 'border-amber-200 bg-amber-200 text-[#171813]' : 'border-slate-600 text-transparent'}`}>{isSelected && <Icon name="check" className="size-3" />}</span>
                  <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold text-slate-200">{suspect.name}</span><span className="font-mono text-[9px] uppercase tracking-[.13em] text-slate-600">S-{String(index + 1).padStart(2, '0')} · {suspect.age}</span></span><span className="mt-1 block text-xs text-slate-500">{suspect.occupation} <span className="text-slate-700">/</span> {suspect.relationshipWithVictim}</span><span className="mt-3 block text-xs leading-5 text-slate-400">{suspect.description}</span><span className="mt-3 grid gap-2 border-t border-white/[0.06] pt-3 text-[11px] sm:grid-cols-2"><span><span className="text-slate-600">Motive: </span><span className="text-slate-400">{suspect.motive}</span></span><span><span className="text-slate-600">Alibi: </span><span className="text-slate-400">{suspect.alibi}</span></span></span></span>
                </div>
              </button>;
            })}
            {caseFile.suspects.length === 0 && <p className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-slate-500">No suspects are available to accuse.</p>}
          </div>
        </Panel>

        <aside className="space-y-4">
          <Panel className="p-5 sm:p-6"><Eyebrow className="mb-3">Before you submit</Eyebrow><h2 className="display-font text-xl text-[#eae8e1]">This is your final call.</h2><p className="mt-3 text-xs leading-6 text-slate-500">Your selection will be checked against the case solution. After it is submitted, the case closes and cannot be changed.</p><div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-600">Selected suspect</p><p className="mt-1.5 text-sm font-semibold text-slate-200">{selectedSuspect?.name || 'No suspect selected'}</p></div><Button type="button" disabled={!selected} onClick={() => setConfirming(true)} className="mt-4 w-full">Review accusation <Icon name="arrow" /></Button></Panel>
          <div className="rounded-xl border border-rose-200/10 bg-rose-200/[0.025] p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-rose-100/70"><span className="size-1.5 rounded-full bg-rose-200/60" /> Irreversible action</p><p className="mt-2 text-[11px] leading-5 text-slate-600">Double-check the details before confirming. There is no second accusation.</p></div>
        </aside>
      </div>

      {confirming && selectedSuspect && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="confirmation-title" className="w-full max-w-md rounded-2xl border border-amber-100/20 bg-[#141d23] p-5 shadow-2xl sm:p-7"><Eyebrow className="mb-3">Confirmation required</Eyebrow><h2 id="confirmation-title" className="display-font text-3xl text-[#f0eee7]">Accuse {selectedSuspect.name}?</h2><p className="mt-3 text-sm leading-6 text-slate-400">This submits your only accusation for <span className="text-slate-200">{caseFile.title}</span> and immediately reveals the case result.</p><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={() => setConfirming(false)} disabled={submitting}>Keep investigating</Button><Button type="button" variant="danger" onClick={confirmAccusation} disabled={submitting}>{submitting ? 'Submitting…' : 'Confirm accusation'} {!submitting && <Icon name="arrow" />}</Button></div></section></div>}
    </PageContainer>
  );
}
