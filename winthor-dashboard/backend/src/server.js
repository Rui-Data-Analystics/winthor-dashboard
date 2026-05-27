import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { queryOracle } from './config/database.js';

// Carrega as variaveis do arquivo .env para o Node.js
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Permite que outras aplicacoes (como o React) acessem esta API
app.use(cors());

// Permite que o Express entenda requisicoes enviadas em formato JSON
app.use(express.json());

// Rota de teste inicial para garantir que o backend esta rodando
app.get('/', (req, res) => {
  res.json({ message: "Backend do Dashboard WinThor esta rodando com sucesso!" });
});

// 1. ROTA DE PRODUTOS REAL (Consultando a tabela PCPRODUT do WinThor)
app.get('/api/produtos', async (req, res) => {
  try {
    const sql = `
      SELECT CODPROD, DESCRICAO, EMBALAGEM, UNIDADE 
      FROM PCPRODUT 
      WHERE ROWNUM <= 15
    `;
    const produtos = await queryOracle(sql);
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ 
      error: "Erro ao consultar banco de dados Oracle", 
      message: error.message,
      tip: "Caso nao esteja conectado a rede da empresa ou o banco nao esteja configurado, use a rota mock: /api/produtos/mock"
    });
  }
});

// 2. ROTA DE MOCK (Para testar sem precisar conectar ao banco real)
// Retorna dados ficticios simulando a tabela PCPRODUT do WinThor
app.get('/api/produtos/mock', (req, res) => {
  const produtosMock = [
    { CODPROD: 1001, DESCRICAO: "ARROZ INTEGRAL 5KG TIO JOAO", EMBALAGEM: "FD C/ 6", UNIDADE: "FD" },
    { CODPROD: 1002, DESCRICAO: "FEIJAO CARIOCA 1KG KIKALDO", EMBALAGEM: "FD C/ 10", UNIDADE: "FD" },
    { CODPROD: 1003, DESCRICAO: "OLEO DE SOJA 900ML LIZA", EMBALAGEM: "CX C/ 20", UNIDADE: "CX" },
    { CODPROD: 1004, DESCRICAO: "AZUCAR REFINADO 1KG UNIAO", EMBALAGEM: "FD C/ 10", UNIDADE: "FD" },
    { CODPROD: 1005, DESCRICAO: "MACARRAO SEMOLA SPAGHETTI ADRIA", EMBALAGEM: "CX C/ 24", UNIDADE: "CX" },
  ];
  res.json(produtosMock);
});

// 3. ROTA DE KPIS REAL
app.get('/api/kpis', async (req, res) => {
  try {
    const sqlFaturamento = `SELECT SUM(VLATEND) AS FATURAMENTO FROM PCNFSAID WHERE CANCELADO = 'N'`;
    const sqlVendasHoje = `SELECT SUM(VLATEND) AS HOJE FROM PCNFSAID WHERE DTEMISSAO = TRUNC(SYSDATE) AND CANCELADO = 'N'`;
    const sqlClientes = `SELECT COUNT(DISTINCT CODCLI) AS CLIENTES FROM PCCLIENT`;

    const faturamentoRes = await queryOracle(sqlFaturamento);
    const vendasHojeRes = await queryOracle(sqlVendasHoje);
    const clientesRes = await queryOracle(sqlClientes);

    res.json({
      faturamento: faturamentoRes[0]?.FATURAMENTO || 0,
      vendasHoje: vendasHojeRes[0]?.HOJE || 0,
      clientesAtivos: clientesRes[0]?.CLIENTES || 0
    });
  } catch (error) {
    res.status(500).json({
      error: "Erro ao consultar KPIs no Oracle",
      message: error.message,
      tip: "Use /api/kpis/mock se estiver testando localmente"
    });
  }
});

// 4. ROTA DE KPIS MOCK
app.get('/api/kpis/mock', (req, res) => {
  res.json({
    faturamento: 158746.22,
    vendasHoje: 12440.00,
    clientesAtivos: 96
  });
});

// 5. ROTA DE FATURAMENTO MENSAL REAL
app.get('/api/faturamento', async (req, res) => {
  try {
    const sql = `
      SELECT TO_CHAR(DTEMISSAO, 'MM') AS MES_NUM,
             TO_CHAR(DTEMISSAO, 'MON') AS MES,
             SUM(VLATEND) AS VALOR
      FROM PCNFSAID
      WHERE DTEMISSAO >= ADD_MONTHS(SYSDATE, -12)
      GROUP BY TO_CHAR(DTEMISSAO, 'MM'), TO_CHAR(DTEMISSAO, 'MON')
      ORDER BY MES_NUM
    `;
    const rows = await queryOracle(sql);
    const formatado = rows.map(r => ({
      name: r.MES || r.MES_NUM,
      faturamento: r.VALOR
    }));
    res.json(formatado);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao consultar faturamento no Oracle",
      message: error.message,
      tip: "Use /api/faturamento/mock se estiver testando localmente"
    });
  }
});

// 6. ROTA DE FATURAMENTO MENSAL MOCK
app.get('/api/faturamento/mock', (req, res) => {
  const faturamentoMock = [
    { name: 'Jan', faturamento: 82000 },
    { name: 'Fev', faturamento: 95000 },
    { name: 'Mar', faturamento: 110000 },
    { name: 'Abr', faturamento: 98000 },
    { name: 'Mai', faturamento: 115000 },
    { name: 'Jun', faturamento: 125000 },
    { name: 'Jul', faturamento: 130000 },
    { name: 'Ago', faturamento: 122000 },
    { name: 'Set', faturamento: 140000 },
    { name: 'Out', faturamento: 145000 },
    { name: 'Nov', faturamento: 152000 },
    { name: 'Dez', faturamento: 158746.22 }
  ];
  res.json(faturamentoMock);
});

// Inicializa o servidor na porta configurada
app.listen(port, () => {
  console.log(`Servidor rodando com sucesso em http://localhost:${port}`);
});
