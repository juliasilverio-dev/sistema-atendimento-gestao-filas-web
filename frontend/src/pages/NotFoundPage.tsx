import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';

export function NotFoundPage() {
  return (
    <>
      <PageHeader eyebrow="PÁGINA NÃO ENCONTRADA" title="Vamos voltar ao atendimento?"
        description="O endereço acessado não corresponde a uma página do sistema." />
      <Link className="button primary" to="/totem">Ir para o totem</Link>
    </>
  );
}
