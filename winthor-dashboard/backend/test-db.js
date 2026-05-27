import { queryOracle } from './src/config/database.js';

async function test() {
  console.log("Iniciando teste de conexao com o Oracle...");
  try {
    // DUAL e uma tabela padrão do Oracle usada para testes
    const rows = await queryOracle("SELECT 'Conexao Realizada com Sucesso!' AS STATUS, SYSDATE FROM DUAL");
    console.log(">>> TESTE BEM SUCEDIDO! <<<");
    console.log("Dados retornados:", rows);
  } catch (err) {
    console.error(">>> FALHA NO TESTE! <<<");
    console.error("Detalhes do erro:", err.message);
    console.log("\nVerifique se o seu .env possui o usuario, senha e IP corretos, e se o banco esta acessivel.");
  }
}

test();
