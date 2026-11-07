import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import type { IconName } from '../ui/Icon';

interface NavigationItem {
  path: string;
  label: string;
  description: string;
  icon: IconName;
}

const navigation: NavigationItem[] = [
  { path: '/totem', label: 'Totem de senhas', description: 'Retire sua senha', icon: 'ticket' },
  { path: '/filas', label: 'Painel de filas', description: 'Acompanhe as chamadas', icon: 'panel' },
  { path: '/atendimento', label: 'Atendimento', description: 'Área do atendente', icon: 'users' },
];

function getPageLabel(path: string): string {
  for (const item of navigation) {
    if (item.path === path) {
      return item.label;
    }
  }

  return 'Página não encontrada';
}

export function AppLayout() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const pageLabel = getPageLabel(pathname);

  useEffect(() => {
    document.title = pageLabel + ' — Atende';

    if (main.current !== null) {
      main.current.focus();
    }
  }, [pathname, pageLabel]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <aside className="sidebar">
        <NavLink to="/totem" className="brand" aria-label="Atende — início">
          <span className="brand-mark" aria-hidden="true"><Icon name="heart" size={24} /></span>
          <span>atende<span className="brand-dot">.</span></span>
        </NavLink>
        <p className="sidebar-caption">CUIDADO EM CADA CHAMADA</p>
        <p className="nav-caption">ESPAÇO DE ATENDIMENTO</p>
        <nav aria-label="Navegação principal">
          {navigation.map((item) => (
            <NavLink
              key={item.path} to={item.path}
              className={(link) => {
                if (link.isActive) {
                  return 'nav-link active';
                }

                return 'nav-link';
              }}
            >
              <Icon name={item.icon} size={21} />
              <span>{item.label}<small>{item.description}</small></span>
              <span className="nav-active-dot" />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="sidebar-heart"><Icon name="heart" size={22} /></span>
          <h2>Organizar também<br />é cuidar.</h2>
          <p>Um atendimento simples, acolhedor e no seu tempo.</p>
        </div>
        <p className="sidebar-bottom">Sistema de atendimento e filas</p>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="breadcrumb">Espaço de atendimento<span>/</span><strong>{pageLabel}</strong></span>
          <span className="topbar-detail"><Icon name="heart" size={15} />Unidade de atendimento</span>
        </header>
        <main id="conteudo" ref={main} tabIndex={-1} className="main-content"><Outlet /></main>
        <footer className="footer">
          <span>atende. <span className="footer-divider">|</span> Mais organização. Mais cuidado.</span>
          <span>Consultas · Exames · Agendamentos</span>
        </footer>
      </div>
    </div>
  );
}
