import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navigation = [
  { path: '/totem', label: 'Totem de senhas', number: '01' },
  { path: '/filas', label: 'Painel de filas', number: '02' },
  { path: '/atendimento', label: 'Atendimento', number: '03' },
];

export function AppLayout() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = navigation.find((item) => item.path === pathname);
    document.title = `${page?.label ?? 'Página não encontrada'} — Atende`;
    main.current?.focus();
  }, [pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <aside className="sidebar">
        <NavLink to="/totem" className="brand" aria-label="Atende — início">
          <span className="brand-mark" aria-hidden="true">a</span>
          <span>atende<span className="brand-dot">.</span></span>
        </NavLink>
        <p className="sidebar-caption">ATENDIMENTO E FILAS</p>
        <nav aria-label="Navegação principal">
          {navigation.map((item) => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="nav-number" aria-hidden="true">{item.number}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="eyebrow">UMA FILA, MAIS CUIDADO</span>
          <p>Atendimento preferencial primeiro. Ordem de chegada em cada categoria.</p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>Sistema de atendimento</span>
          <span className="topbar-detail">Consultas · Exames · Agendamentos</span>
        </header>
        <main id="conteudo" ref={main} tabIndex={-1} className="main-content">
          <Outlet />
        </main>
        <footer className="footer">Atende · Organização para cada atendimento.</footer>
      </div>
    </div>
  );
}
