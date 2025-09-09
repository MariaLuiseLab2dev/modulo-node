/**
 * Construa então um helper específico para pedidos, 
 * contendo funções que permitam:
 * - criar registros, 
 * - listar todos os pedidos existentes 
 *      (realizando um JOIN com a tabela de produtos para exibir também o nome do produto associado), 
 * - atualizar a quantidade de um pedido já cadastrado e 
 * - excluir pedidos pelo identificador. 
 */

const db = require('./database/database.js');

function runQuery(sql, params = []) {
    return new Promise( (resolve, reject) => {
        db.run("PRAGMA foreign_keys = ON");
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Erro ao executar a query: ', err);
                reject(err);
            } else {
                resolve( { lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Erro ao executar a query: ', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Erro ao executar a query', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}


module.exports = {runQuery, getQuery,  allQuery};