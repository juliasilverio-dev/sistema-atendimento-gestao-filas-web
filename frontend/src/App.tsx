import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { TotemPage } from './pages/TotemPage';
import { FilasPage } from './pages/FilasPage';
import { AtendimentoPage } from './pages/AtendimentoPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/totem" replace />} />
        <Route path="totem" element={<TotemPage />} />
        <Route path="filas" element={<FilasPage />} />
        <Route path="atendimento" element={<AtendimentoPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
