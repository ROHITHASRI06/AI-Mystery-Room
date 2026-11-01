import { Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import HomePage from './pages/HomePage.jsx';
import CreateMysteryPage from './pages/CreateMysteryPage.jsx';
import InvestigationPage from './pages/InvestigationPage.jsx';
import AccusationPage from './pages/AccusationPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateMysteryPage />} />
        <Route path="/cases/:caseId" element={<InvestigationPage />} />
        <Route path="/cases/:caseId/accuse" element={<AccusationPage />} />
        <Route path="/cases/:caseId/results" element={<ResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
