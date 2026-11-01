import { Link } from 'react-router-dom';
import { Eyebrow, Icon, LinkButton, PageContainer } from '../components/UI.jsx';

const difficulties = [
  { name: 'Easy', count: '03 suspects', clues: '05 clues', tone: 'text-emerald-200' },
  { name: 'Medium', count: '04 suspects', clues: '07 clues', tone: 'text-sky-200' },
  { name: 'Hard', count: '05 suspects', clues: '09 clues', tone: 'text-amber-200' },
];

const steps = [
  { number: '01', title: 'Set the scene', detail: 'Describe the mystery you want to solve and choose how challenging the case should be.' },
  { number: '02', title: 'Follow the evidence', detail: 'Question the details, open clues, compare alibis, and spend your hints carefully.' },
  { number: '03', title: 'Name your suspect', detail: 'Make one final accusation. The case file reveals its solution after your decision.' },
];

export default function HomePage() {
  return (
    <>
      <PageContainer className="pb-16 pt-10 sm:pb-24 sm:pt-16">
        <section className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#101820] px-6 py-10 shadow-[0_30px_90px_rgba(0,0,0,.25)] sm:px-12 sm:py-14 lg:px-16 lg:py-16">
          <div aria-hidden="true" className="line-grid absolute inset-0 -z-10 opacity-60" />
          <div aria-hidden="true" className="absolute -right-28 -top-32 -z-10 size-[430px] rounded-full border border-amber-100/[0.07]" />
          <div aria-hidden="true" className="absolute -right-8 -top-12 -z-10 size-[265px] rounded-full border border-amber-100/[0.06]" />
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200/15 bg-amber-100/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/80"><span className="size-1.5 rounded-full bg-amber-200" /> Your next case is waiting</div>
              <h1 className="display-font text-5xl leading-[.98] tracking-[-0.045em] text-[#f1efe8] sm:text-7xl">Every mystery<br /><span className="text-amber-200">leaves a trace.</span></h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">Step into the investigator’s chair. Build a case around your own premise, examine the evidence, and decide who is telling the truth.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <LinkButton to="/create" className="px-5">Open a new case <Icon name="arrow" /></LinkButton>
                <a href="#how-it-works" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.04]">How investigations work <span aria-hidden="true">↓</span></a>
              </div>
              <div className="mt-8 flex items-center gap-3 text-[10px] text-slate-500"><span className="flex -space-x-1.5"><span className="size-5 rounded-full border border-[#101820] bg-[#48565a]" /><span className="size-5 rounded-full border border-[#101820] bg-[#806b4f]" /><span className="size-5 rounded-full border border-[#101820] bg-[#596b70]" /></span><span>One case. One accusation. No second guesses.</span></div>
            </div>

            <div className="relative mx-auto w-full max-w-[370px] lg:ml-auto">
              <div className="absolute -inset-6 rounded-[32px] bg-amber-200/[0.025] blur-2xl" />
              <div className="paper-grain relative rotate-[1.5deg] rounded-2xl border border-[#d6c9a5]/20 bg-[#1a211f] p-5 shadow-[0_24px_70px_rgba(0,0,0,.4)] sm:p-6">
                <div className="flex items-center justify-between border-b border-[#ded0ad]/10 pb-4"><div><Eyebrow className="text-[8px] text-amber-200/55">The investigator’s method</Eyebrow><p className="display-font mt-1 text-lg text-[#e6dfc9]">Follow what doesn’t fit.</p></div><span className="grid size-8 place-items-center rounded-lg border border-amber-200/15 text-amber-100/70"><Icon name="eye" /></span></div>
                <div className="relative mt-6 space-y-3">
                  {[['01', 'Observe', 'Start with the premise'], ['02', 'Examine', 'Record what the evidence says'], ['03', 'Connect', 'Test each account against the facts'], ['04', 'Decide', 'Make one final accusation']].map(([number, title, detail], index) => <div key={number} className="relative flex items-center gap-3 rounded-lg border border-[#d6c9a5]/10 bg-black/[0.09] p-3.5">{index < 3 && <span aria-hidden="true" className="absolute -bottom-3 left-[22px] z-10 h-3 w-px bg-amber-100/20" />}<span className="font-mono text-[9px] text-amber-200/55">{number}</span><span className="min-w-0"><span className="block text-xs font-semibold text-[#e2dece]">{title}</span><span className="mt-0.5 block text-[9px] text-[#918f83]">{detail}</span></span><span className="ml-auto size-1.5 rounded-full bg-amber-200/35" /></div>)}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#ded0ad]/10 pt-4"><span className="font-mono text-[8px] uppercase tracking-[.18em] text-[#87887e]">One case at a time</span><span className="flex size-7 items-center justify-center rounded-full border border-amber-100/15 text-amber-100/70"><Icon name="arrow" className="size-3" /></span></div>
              </div>
              <div className="absolute -bottom-6 -left-3 -z-10 h-24 w-40 rotate-[-5deg] rounded-xl border border-white/[0.04] bg-[#171e22] sm:-left-8" />
              <span className="absolute -right-4 top-10 size-2 rounded-full bg-rose-300/60 shadow-[0_0_18px_rgba(253,164,175,.6)]" />
            </div>
          </div>
        </section>

        <section className="mt-9 grid gap-3 sm:grid-cols-3">
          {difficulties.map((difficulty) => <article key={difficulty.name} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5"><div><p className={`text-xs font-bold uppercase tracking-[.14em] ${difficulty.tone}`}>{difficulty.name}</p><p className="mt-1 text-[10px] text-slate-600">{difficulty.count} <span className="text-slate-700">·</span> {difficulty.clues}</p></div><span className="font-mono text-[9px] text-slate-700">CASE LEVEL</span></article>)}
        </section>

        <section id="how-it-works" className="scroll-mt-8 pt-20 sm:pt-28">
          <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><Eyebrow className="mb-3">The investigation</Eyebrow><h2 className="display-font text-3xl tracking-[-.025em] text-[#f0eee7] sm:text-4xl">A case is only as strong<br className="hidden sm:block" /> as the details you notice.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">Three deliberate steps take you from a strange incident to a final verdict.</p></div>
          <div className="grid gap-3 md:grid-cols-3">{steps.map((step) => <article key={step.number} className="group rounded-2xl border border-white/[0.07] bg-[#111920]/80 p-5 transition hover:border-amber-100/15 sm:p-6"><p className="font-mono text-[10px] tracking-[.2em] text-amber-200/60">{step.number} <span className="text-slate-700">/</span> FIELD NOTE</p><h3 className="display-font mt-7 text-xl text-[#e9e7df]">{step.title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{step.detail}</p></article>)}</div>
          <div className="mt-8 flex justify-center"><Link to="/create" className="group inline-flex items-center gap-2 text-sm font-semibold text-amber-200 transition hover:text-amber-100">Ready to investigate? <span className="transition group-hover:translate-x-1"><Icon name="arrow" /></span></Link></div>
        </section>
      </PageContainer>
    </>
  );
}
