<div align="center">

<h1>✦ atende. ✦</h1>

<p><samp>consultas · exames · agendamentos</samp></p>
<p>Seu próximo atendimento, em uma nova aba.</p>

<p>
  <kbd>React</kbd>
  <kbd>TypeScript</kbd>
  <kbd>Vite</kbd>
  <kbd>Express</kbd>
</p>

</div>

---

O **Atende** é um projeto para organizar senhas e chamadas de atendimento em um fluxo simples: escolher um serviço, retirar uma senha e acompanhar sua vez.

São três telas conectadas à mesma API, com prioridade preferencial, atualização automática e um visual pensado para deixar a espera mais tranquila.

## Um passeio pelo Atende

**01 — Totem de senhas**

Escolha a categoria, selecione o serviço e retire sua senha. O código aparece em um comprovante na tela, com as informações da emissão.

**02 — Painel de filas**

Acompanhe a última senha chamada e a ordem de espera. O painel consulta a API automaticamente e avisa se a conexão falhar.

**03 — Atendimento**

Chame a próxima senha com um clique. O servidor aplica a prioridade e retira a pessoa certa da fila.

> ✧ A senha identifica sua vez. A ordem vem da fila.

## Rodar localmente

Você vai precisar de **Node.js 22.12 ou superior**, com npm. A versão usada nas verificações foi a **24.14**.

Com o projeto no seu computador, abra o terminal na pasta que contém este README e execute:

```bash
npm run setup
npm run build
npm start
```

Abra **[localhost:3000](http://localhost:3000)** e pronto: a interface e a API ficam no mesmo endereço.

- `setup` instala as dependências do backend e do frontend. Use na primeira execução ou depois de atualizar as dependências.
- `build` prepara a versão compilada. Execute novamente depois de alterar o código.
- `start` inicia o servidor. Na primeira execução, também faz o build se os arquivos compilados ainda não existirem.

Para encerrar o servidor, pressione **Ctrl+C** no terminal.

<details>
<summary>Usando PowerShell?</summary>

Se o terminal bloquear `npm.ps1`, use `npm.cmd` no lugar de `npm`:

```powershell
npm.cmd run setup
npm.cmd run build
npm.cmd start
```

</details>

## Test drive

Abra as telas em abas diferentes:

- [Totem](http://localhost:3000/totem) — para emitir senhas.
- [Painel](http://localhost:3000/filas) — para acompanhar as chamadas.
- [Atendimento](http://localhost:3000/atendimento) — para chamar a próxima pessoa.

Para experimentar a prioridade:

1. Emita uma senha **normal de consulta**.
2. Depois, emita uma **preferencial de exame**.
3. Confira a ordem no painel.
4. Clique em **Chamar próximo** na tela de atendimento.

A preferencial será chamada primeiro. A normal continuará aguardando, e o painel refletirá a chamada na próxima consulta automática.

## Modo dev

Para trabalhar no código, execute na raiz:

```bash
npm run dev
```

A interface fica em **[127.0.0.1:5173](http://127.0.0.1:5173)**, e a API, em **[localhost:3000](http://localhost:3000/api/line)**.

O Vite atualiza a interface ao salvar alterações. Depois de mudar o backend, reinicie o comando. Use um modo de execução por vez: `dev` e `start` utilizam a mesma porta da API.

Para conferir o projeto:

```bash
npm run check
```

Esse comando verifica os tipos dos dois pacotes e executa os testes do backend. Os cenários incluem prioridade, ordem de chegada, colisões de códigos, entradas inválidas e chamadas simultâneas.

## Por dentro da fila

Cada senha recebe um **código aleatório de oito caracteres**. O servidor confere se ele já foi usado antes de confirmar a emissão, incluindo códigos de senhas que já foram chamadas.

A espera é organizada em duas **filas FIFO encadeadas**: uma normal e outra preferencial. Cada nó guarda uma senha e a referência para o próximo nó.

- Uma nova senha entra no **fim** da fila da sua categoria.
- A chamada retira a senha do **início** da fila escolhida.
- Havendo preferenciais, elas são chamadas primeiro, independentemente do serviço.
- Dentro de cada categoria, vale a ordem de chegada.

O fluxo de uma senha é `aguardando → chamada`. Quando a espera termina, a última chamada continua no painel.

O painel e o atendente agendam uma nova consulta dois segundos depois de a anterior terminar. Se a conexão falhar, os últimos dados confirmados permanecem visíveis com um aviso.

<details>
<summary>Um pouco mais sobre as estruturas</summary>

A classe de fila mantém referências para o início, o fim e o tamanho. Inserir e retirar custam **O(1)**; percorrer a espera para exibir os dados custa **O(n)**.

Os códigos emitidos também ficam em um registro auxiliar. A busca de um código já usado é sequencial e custa **O(m)**, sendo `m` o total de senhas emitidas durante a execução.

A fila preserva a ordem pelos próprios nós, inclusive quando duas emissões têm horários iguais. A seleção entre normal e preferencial fica na regra de atendimento.

</details>

## Mapa do projeto

- **`backend/src/modules/tickets/`** — emissão, validação, geração de códigos e registros.
- **`backend/src/modules/atendimento/`** — consulta da fila e escolha da próxima senha.
- **`backend/src/compartilhado/estruturas-de-dados/`** — implementação de nó e fila.
- **`backend/src/tests/`** — testes das estruturas, regras e rotas HTTP.
- **`frontend/src/pages/`** — totem, painel e atendimento.
- **`frontend/src/components/`** — elementos visuais compartilhados entre as telas.
- **`frontend/src/services/`** — comunicação com a API e validação das respostas.
- **`frontend/src/hooks/useLine.ts`** — atualização automática e cancelamento de consultas.
- **`comandos/`** — execução dos comandos a partir da raiz.

<details>
<summary>API · abrir os detalhes</summary>

As operações disponíveis são:

- `GET /api/categories` — lista as categorias.
- `GET /api/services` — lista os serviços.
- `POST /api/tickets` — emite uma senha.
- `GET /api/line` — retorna a espera e a última chamada.
- `POST /api/line/next` — chama a próxima senha.

Para emitir, envie somente categoria e serviço:

```json
{
  "category": "preferencial",
  "service": "exame"
}
```

O backend define o código, a situação e os horários. Respostas de sucesso usam `data`; falhas usam `error`, com código e mensagem. Uma chamada com a espera vazia retorna `data: null` e preserva a última chamada.

</details>

## Sobre esta versão

Os dados ficam **em memória, em um único processo**. Atualizar o navegador preserva as senhas; reiniciar o servidor começa uma fila vazia. O sistema mantém uma chamada atual global.

A chamada registra que a senha foi chamada, sem confirmar presença ou conclusão do atendimento. O serviço **agendamento** representa a finalidade da senha; a versão atual trabalha com a fila, sem reservas de datas ou horários.

A porta do servidor pode ser definida com `PORT`. Para ajustar a conexão durante o desenvolvimento, use [`frontend/.env.example`](frontend/.env.example) como referência. O Vite encaminha as requisições da interface para a API por um proxy.

---

<div align="center">
  <samp>✦ uma senha de cada vez. ✦</samp>
</div>
