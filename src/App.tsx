import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { GuestList } from './pages/GuestList';
import { Overview } from './pages/Overview';
import { PlanGuard } from './components/PlanGuard';
import { InvitationList } from './pages/InvitationList';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/:planId" element={<PlanGuard />}>
          <Route index element={<Overview />} />
          <Route path="budget" element={<Dashboard />} />
          <Route path="guests" element={<GuestList />} />
          <Route path="invitations" element={<InvitationList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
