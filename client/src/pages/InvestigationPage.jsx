import { useEffect, useState } from 'react';
import { Link, Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { CaseMeta, ClueCard, HintsPanel, SuspectCard, TimelinePanel } from '../components/CaseComponents.jsx';
import { DifficultyBadge, ErrorNotice, Eyebrow, Icon, LinkButton, LoadingState, PageContainer, PageHeading, Panel, PanelTitle, ProgressBar } from '../components/UI.jsx';
import { caseApi, getApiError } from '../services/api.js';

export default function InvestigationPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseFile, setCaseFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyClue, setBusyClue] = useState('');
  const [requestingHint, setRequestingHint] = useState(false);
  const [requestedHints, setRequestedHints] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setLoadError('');
    caseApi.getCase(caseId)
      .then((data) => { if (current) setCaseFile(data); })
      .catch((error) => { if (current) setLoadError(getApiError(error, 'The case file could not be loaded.')); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [caseId, reloadKey]);

  async function handleDiscover(clueId) {
    setActionError('');
    setNotice('');
    setBusyClue(clueId);
    try {
      const response = await caseApi.discoverClue(caseId, clueId);
      setCaseFile((current) => ({
        ...current,
        discoveredClueCount: response.discoveredClueCount,
        clues: current.clues.map((clue) => clue.clueId === clueId ? { ...clue, ...response.clue, discovered: true } : clue),
      }));
      setNotice(response.alreadyDiscovered ? 'This evidence was already in your notes.' : `${response.clue.title} has been added to the evidence log.`);
    } catch (error) {
      setActionError(getApiError(error, 'The clue could not be recorded.'));
    } finally {
      setBusyClue('');
    }
  }

  async function handleHint() {
    setActionError('');
    setNotice('');
    setRequestingHint(true);
    try {
      const response = await caseApi.requestHint(caseId);
      setRequestedHints((hints) => [...hints, response.hint]);
      setCaseFile((current) => ({ ...current, hintsRemaining: response.hintsRemaining, hintsUsed: current.hintsUsed + 1 }));
      setNotice('A new field note has been added below.');
    } catch (error) {
      setActionError(getApiError(error, 'A hint could not be requested.'));
    } finally {
      setRequestingHint(false);
    }
  }

  if (loading) return <PageContainer><LoadingState label="Retrieving the case file…" /></PageContainer>;
  if (loadError) return <PageContainer><div className="mx-auto max-w-2xl"><ErrorNotice onRetry={() => setReloadKey((key) => key + 1)}>{loadError}</ErrorNotice><Link to="/create" className="mt-5 inline-block text-xs text-amber-200 hover:text-amber-100">Open a new case →</Link></div></PageContainer>;
  if (!caseFile) return null;

  const isCompleted = caseFile.status === 'completed';

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <RouterLink to="/create" className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-200"><span aria-hidden="true">←</span> Case desk</RouterLink>
        <div className="flex items-center gap-2"><span className={`size-1.5 rounded-full ${isCompleted ? 'bg-slate-500' : 'bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.45)]'}`} /><span className="font-mono text-[9px] uppercase tracking-[.17em] text-slate-500">{isCompleted ? 'Case closed' : 'Investigation active'}</span><span className="text-slate-700">/</span><span className="font-mono text-[9px] text-slate-600">{caseId.slice(0, 8).toUpperCase()}</span></div>
      </div>

      <PageHeading
        eyebrow="Investigation room / Case file"
        title={caseFile.title}
        description={caseFile.crimeDescription}
        action={<DifficultyBadge difficulty={caseFile.difficulty} />}
      />

      {isCompleted && <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200/15 bg-amber-200/[0.045] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-amber-100">This investigation is closed.</p><p className="mt-1 text-xs text-slate-400">The result is ready. Review the verdict and solution in the case summary.</p></div><LinkButton to={`/cases/${caseId}/results`} className="shrink-0">View case result <Icon name="arrow" /></LinkButton></div>}

      {actionError && <div className="mb-4"><ErrorNotice>{actionError}</ErrorNotice></div>}
      {notice && !actionError && <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200/15 bg-emerald-200/[0.045] px-4 py-3 text-xs text-emerald-100/90"><Icon name="check" className="size-4" />{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss message" className="ml-auto px-2 text-emerald-100/60 hover:text-white">×</button></div>}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-6">
          <Panel>
            <PanelTitle eyebrow="Briefing" title="The case at a glance" aside={<span className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.12em] ${isCompleted ? 'border-slate-500/20 text-slate-500' : 'border-emerald-200/15 text-emerald-200/80'}`}>{caseFile.status}</span>} />
            <div className="space-y-5 p-5 sm:p-6"><p className="text-sm leading-7 text-slate-300">{caseFile.backgroundStory}</p><CaseMeta victim={caseFile.victim} location={caseFile.location} timeline={caseFile.timeline} /><div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"><p className="mb-1.5 text-[9px] font-bold uppercase tracking-[.17em] text-slate-600">Victim profile</p><p className="text-xs leading-5 text-slate-400">{caseFile.victim?.details}</p></div></div>
          </Panel>

          <Panel>
            <PanelTitle eyebrow="People of interest" title="Suspects" aside={<span className="text-[10px] text-slate-500">{caseFile.suspects.length} profiles</span>} />
            {caseFile.suspects.length ? <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">{caseFile.suspects.map((suspect, index) => <SuspectCard key={suspect.suspectId} suspect={suspect} index={index} />)}</div> : <p className="px-6 py-8 text-center text-sm text-slate-500">No suspect profiles are available for this case.</p>}
          </Panel>

          <Panel>
            <PanelTitle eyebrow="Examine the scene" title="Evidence log" aside={<span className="text-[10px] text-slate-500">Click a sealed item to inspect it</span>} />
            <div className="space-y-5 p-4 sm:p-5"><ProgressBar value={caseFile.discoveredClueCount} max={caseFile.clues.length} label="Evidence reviewed" /><div className="grid gap-3 md:grid-cols-2">{caseFile.clues.map((clue) => <ClueCard key={clue.clueId} clue={clue} onDiscover={handleDiscover} busy={Boolean(busyClue)} locked={isCompleted} />)}</div>{caseFile.clues.length === 0 && <p className="rounded-xl border border-dashed border-white/[0.08] p-7 text-center text-sm text-slate-500">No evidence has been logged for this case.</p>}</div>
          </Panel>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6">
          <Panel>
            <PanelTitle eyebrow="Your progress" title="Investigation status" />
            <div className="space-y-5 p-5"><ProgressBar value={caseFile.discoveredClueCount} max={caseFile.clues.length} label="Clues discovered" /><div className="grid grid-cols-2 gap-2"><div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"><span className="display-font text-2xl text-[#e8e5da]">{caseFile.discoveredClueCount}</span><span className="mt-1 block text-[9px] uppercase tracking-[.12em] text-slate-600">Evidence pieces</span></div><div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"><span className="display-font text-2xl text-amber-100/85">{caseFile.hintsRemaining}</span><span className="mt-1 block text-[9px] uppercase tracking-[.12em] text-slate-600">Hints left</span></div></div><div className="border-t border-white/[0.06] pt-4"><p className="mb-3 text-[9px] font-bold uppercase tracking-[.16em] text-slate-600">Before you accuse</p><ul className="space-y-2 text-[11px] text-slate-500"><li className="flex items-center gap-2"><span className="size-1 rounded-full bg-amber-200/50" />Compare each alibi with the timeline</li><li className="flex items-center gap-2"><span className="size-1 rounded-full bg-amber-200/50" />Look for details that only one suspect could know</li></ul></div>{isCompleted ? <LinkButton to={`/cases/${caseId}/results`} className="w-full">View case result <Icon name="arrow" /></LinkButton> : <LinkButton to={`/cases/${caseId}/accuse`} className="w-full">Make an accusation <Icon name="arrow" /></LinkButton>}</div>
          </Panel>

          <HintsPanel hints={requestedHints} remaining={caseFile.hintsRemaining} onRequest={handleHint} busy={requestingHint} locked={isCompleted} />
          <TimelinePanel timeline={caseFile.timeline} />
        </aside>
      </div>
      {isCompleted && <div className="mt-8 text-center"><Button variant="quiet" onClick={() => navigate(`/cases/${caseId}/results`)}>Go to the results page <Icon name="arrow" /></Button></div>}
    </PageContainer>
  );
}
