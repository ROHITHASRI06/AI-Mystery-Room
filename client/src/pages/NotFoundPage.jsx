import { Link } from 'react-router-dom';
import { Eyebrow, PageContainer } from '../components/UI.jsx';

export default function NotFoundPage() {
  return <PageContainer className="flex min-h-[55vh] items-center justify-center"><div className="max-w-lg text-center"><Eyebrow className="mb-3">File not found / 404</Eyebrow><h1 className="display-font text-4xl text-[#f1efe8]">This trail leads nowhere.</h1><p className="mt-3 text-sm leading-6 text-slate-500">The page you’re looking for is not in this case file.</p><Link to="/" className="mt-6 inline-flex rounded-xl border border-white/[0.09] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.05]">Return to the briefing</Link></div></PageContainer>;
}
