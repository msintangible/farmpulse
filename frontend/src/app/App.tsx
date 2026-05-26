import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import LandingPage from './components/LandingPage';
import FarmDashboard from './components/FarmDashboard';
import FarmView from './components/FarmView';
import FieldDetailView from './components/FieldDetailView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<FarmDashboard />} />
        <Route path="/farm/:farmId" element={<FarmView />} />
        <Route path="/farm/:farmId/field/:fieldId" element={<FieldDetailView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}