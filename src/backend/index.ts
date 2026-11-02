import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/gerarSenha', (req: Request, res: Response) => {
  res.json({ mensagem: "Uma senha será gerada!" });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});