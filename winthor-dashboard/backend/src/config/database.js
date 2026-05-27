import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

// Configura o driver para retornar os resultados das consultas como Objetos JavaScript (chave: valor)
// Exemplo: { CODPROD: 1, DESCRICAO: 'PRODUTO TESTE' } ao inves de array [1, 'PRODUTO TESTE']
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/**
 * Funcao auxiliar para executar consultas SQL no banco de dados Oracle do WinThor.
 * Ela abre a conexao, executa a query e fecha a conexao automaticamente.
 * 
 * @param {string} sql - A consulta SQL a ser executada.
 * @param {object|array} binds - Parametros variaveis para a query (opcional).
 * @returns {Promise<Array>} - Retorna um array com as linhas encontradas.
 */
export async function queryOracle(sql, binds = []) {
  let connection;

  try {
    // Abre a conexao com o banco de dados Oracle
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    console.log('Conexao com o Oracle estabelecida com sucesso!');

    // Executa a consulta SQL
    const result = await connection.execute(sql, binds);
    
    // Retorna as linhas encontradas
    return result.rows;

  } catch (error) {
    console.error('Erro ao conectar ou executar query no Oracle:', error.message);
    throw error;
  } finally {
    // Garante que a conexao sempre sera fechada, mesmo se ocorrer um erro
    if (connection) {
      try {
        await connection.close();
        console.log('Conexao com o Oracle fechada.');
      } catch (closeError) {
        console.error('Erro ao fechar a conexao com o Oracle:', closeError.message);
      }
    }
  }
}
