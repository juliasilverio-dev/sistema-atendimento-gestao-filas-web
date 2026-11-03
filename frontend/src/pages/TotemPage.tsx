import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Notice } from '../components/ui/Notice';
import { TicketCard } from '../components/tickets/TicketCard';
import { categoryLabels, isCategory, isService, serviceLabels } from '../constants/catalog';
import { errorMessage } from '../services/api';
import { createTicket } from '../services/tickets';
import type { Ticket } from '../types/ticket';

export function TotemPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const values = new FormData(event.currentTarget);
    const category = values.get('category');
    const service = values.get('service');
    if (!isCategory(category) || !isService(service)) {
      setError('Selecione o serviço e a categoria de atendimento.');
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      setTicket(await createTicket({ category, service }));
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="01 / TOTEM DE SENHAS" title="Como podemos ajudar?"
        description="Escolha o serviço e a categoria para retirar sua senha de atendimento." />
      <div className="content-grid">
        <section className="panel" aria-labelledby="emissao-title">
          <h2 id="emissao-title">{ticket ? 'Sua senha foi emitida' : 'Retire sua senha'}</h2>
          {ticket ? (
            <div className="stack">
              <Notice variant="success" message="Senha registrada. Acompanhe sua chamada no painel de filas." />
              <TicketCard ticket={ticket} />
              <button className="button primary" onClick={() => setTicket(null)}>Emitir uma nova senha</button>
            </div>
          ) : (
            <form onSubmit={(event) => { void handleSubmit(event); }} className="stack" aria-busy={isSubmitting}>
              <fieldset disabled={isSubmitting} className="form-fields stack">
                <div className="field">
                  <label htmlFor="service">Qual serviço você precisa?</label>
                  <select id="service" name="service" defaultValue="" required>
                    <option value="" disabled>Selecione um serviço</option>
                    {Object.entries(serviceLabels).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="category">Categoria de atendimento</label>
                  <select id="category" name="category" defaultValue="" required>
                    <option value="" disabled>Selecione uma categoria</option>
                    {Object.entries(categoryLabels).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                  </select>
                </div>
              </fieldset>
              {error && <Notice message={error} />}
              <button className="button primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Emitindo senha…' : 'Emitir senha'}
              </button>
            </form>
          )}
        </section>
        <aside className="help-panel">
          <span className="eyebrow">COMO FUNCIONA</span>
          <h2>Seu atendimento começa aqui.</h2>
          <ol className="steps">
            <li>Selecione o serviço e a categoria.</li>
            <li>Guarde o código da sua senha.</li>
            <li>Acompanhe o painel e aguarde sua chamada.</li>
          </ol>
          <p className="helper-text">As senhas preferenciais são chamadas primeiro. Dentro de cada categoria, vale a ordem de emissão.</p>
        </aside>
      </div>
    </>
  );
}
