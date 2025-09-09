// Importar o pacote sqlite3. O modo verbose é opcional, mas ajuda com logs de depuração.
const sqlite3 = require('sqlite3').verbose();

// Definir o caminho para o arquivo do banco de dados.
const DB_PATH = './database/meu_banco.db';

// Criar uma nova instância do banco de dados, abrindo a conexão.
// Se o arquivo não existir, ele será criado.
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Exportar a instância do banco de dados para que possa ser usada em outros arquivos.
module.exports = db;