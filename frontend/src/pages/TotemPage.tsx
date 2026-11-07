import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Notice } from '../components/ui/Notice';
import { Icon } from '../components/ui/Icon';
import type { IconName } from '../components/ui/Icon';
import { TicketCard } from '../components/tickets/TicketCard';
import { serviceLabels } from '../constants/catalog';
import { errorMessage } from '../services/api';
import { createTicket } from '../services/tickets';
import type { ServiceCode, Ticket, TicketCategory } from '../types/ticket';

interface ServiceOption {
  code: ServiceCode;
  icon: IconName;
  description: string;
}

const services: ServiceOption[] = [
  { code: 'consulta', icon: 'consultation', description: 'Atendimento em saúde' },
  { code: 'exame', icon: 'exam', description: 'Realização de exames' },
  { code: 'agendamento', icon: 'calendar', description: 'Marque seu atendimento' },
];

function getOptionClassName(baseClass: string, isSelected: boolean): string {
  if (isSelected) {
    return baseClass + ' selected';
  }

  return baseClass;
}

export function TotemPage() {
  const [category, setCategory] = useState<TicketCategory | null>(null);
  const [service, setService] = useState<ServiceCode | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const receipt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ticket !== null && receipt.current !== null) {
      receipt.current.focus();
    }
  }, [ticket]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // O formulário chama a API sem recarregar a página inteira.
    event.preventDefault();

    if (submitting.current || category === null || service === null) {
      return;
    }

    // A referência bloqueia cliques repetidos antes da próxima renderização.
    submitting.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const issuedTicket = await createTicket({ category: category, service: service });
      setTicket(issuedTicket);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  function startAgain() {
    setTicket(null);
    setCategory(null);
    setService(null);
    setError(null);
  }

  let serviceDescription = 'Selecione uma categoria para continuar.';
  if (category !== null) {
    serviceDescription = 'Do que você precisa hoje?';
  }

  let submitLabel = 'Emitir minha senha';
  if (isSubmitting) {
    submitLabel = 'Emitindo sua senha…';
  }

  // Escolhemos o conteúdo antes do JSX principal: recibo ou formulário.
  let emissionContent: ReactNode;

  if (ticket !== null) {
    emissionContent = (
      <div className="stack receipt-result" ref={receipt} tabIndex={-1}>
        <div className="success-heading">
          <span className="success-icon"><Icon name="check" /></span>
          <div>
            <h2>Pronto! Sua senha foi emitida.</h2>
            <p>Acompanhe o código no painel de filas.</p>
          </div>
        </div>
        <TicketCard ticket={ticket} />
        <button className="button primary wide" onClick={startAgain}>
          Emitir uma nova senha<Icon name="arrow" size={18} />
        </button>
        <Link className="text-link" to="/filas">Acompanhar o painel de filas</Link>
      </div>
    );
  } else {
    emissionContent = (
      <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
        {/* Radios nativos permitem escolher opções por clique, Tab e setas. */}
        <fieldset className="choice-fieldset" disabled={isSubmitting}>
          <legend><span className="step-number">1</span>Selecione sua categoria</legend>
          <p className="field-description">Como será o seu atendimento?</p>
          <div className="category-options">
            <label className={getOptionClassName('choice-card', category === 'normal')}>
              <input
                type="radio" name="category" value="normal"
                checked={category === 'normal'}
                onChange={() => setCategory('normal')} required
              />
              <span className="choice-icon"><Icon name="users" size={25} /></span>
              <strong>Normal</strong>
              <span>Atendimento geral</span>
              <span className="radio-indicator" />
            </label>
            <label className={getOptionClassName('choice-card', category === 'preferencial')}>
              <input
                type="radio" name="category" value="preferencial"
                checked={category === 'preferencial'}
                onChange={() => setCategory('preferencial')} required
              />
              <span className="choice-icon amber"><Icon name="star" size={25} /></span>
              <strong>Preferencial</strong>
              <span>Atendimento com prioridade</span>
              <span className="radio-indicator" />
            </label>
          </div>
        </fieldset>
        <fieldset className="choice-fieldset service-fieldset" disabled={category === null || isSubmitting}>
          <legend><span className="step-number">2</span>Escolha o serviço</legend>
          <p className="field-description">{serviceDescription}</p>
          <div className="service-options">
            {services.map((item) => (
              <label key={item.code} className={getOptionClassName('service-option', service === item.code)}>
                <input
                  type="radio" name="service" value={item.code}
                  checked={service === item.code}
                  onChange={() => setService(item.code)} required
                />
                <Icon name={item.icon} size={25} />
                <strong>{serviceLabels[item.code]}</strong>
                <span>{item.description}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {error && <Notice message={error} />}
        <div className="emission-bottom">
          <p><Icon name="ticket" size={16} />Uma senha, um passo mais perto do seu atendimento.</p>
          <button className="button primary wide" type="submit" disabled={category === null || service === null || isSubmitting}>
            {submitLabel}<Icon name="arrow" size={19} />
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="TOTEM DE AUTOATENDIMENTO"
        title="Seu cuidado começa aqui."
        description="Retire sua senha e aguarde com tranquilidade. Vamos cuidar de você."
      />
      <div className="totem-grid">
        <section className="panel emission-panel" aria-label="Emissão de senha">
          {emissionContent}
        </section>
        <aside className="totem-aside">
          <div className="care-card">
            <span className="care-icon"><Icon name="heart" size={27} /></span>
            <span className="eyebrow">MAIS CALMA, MAIS CUIDADO</span>
            <h2>Uma espera<br />mais tranquila.</h2>
            <p>Organizamos cada chamada para que você se preocupe com o que mais importa: sua saúde.</p>
            <div className="ticket-illustration" aria-hidden="true">
              <span>atende.</span>
              <Icon name="ticket" size={24} />
              <div className="illustration-dash" />
              <strong>Seu próximo<br />passo é aqui.</strong>
              <div className="illustration-bars" />
            </div>
          </div>
          <div className="help-card">
            <h2>É simples assim</h2>
            <ol className="steps">
              <li>Escolha a categoria e o serviço.</li>
              <li>Guarde o código da sua senha.</li>
              <li>Acompanhe sua chamada no painel.</li>
            </ol>
          </div>
        </aside>
      </div>
      <p className="page-note"><Icon name="clock" size={16} />Preferenciais são chamados primeiro. Em cada categoria, seguimos a ordem de chegada.</p>
    </>
  );
}
