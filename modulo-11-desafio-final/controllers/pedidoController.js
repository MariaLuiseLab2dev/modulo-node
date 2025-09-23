const { runQuery, getQuery, allQuery } = require('../database/database-helper');
const { validarPedido, validaIdPedido } = require('../utils/utils-helper');

exports.createOrder = async (req, res, next) => {
    try {
        const { valor_total, itens } = await validarPedido(req.body);

        // 1. Insere o pedido
        const sqlInsertPedido = `INSERT INTO pedidos (valor_total) VALUES (?)`;
        const resultadoPedido = await runQuery(sqlInsertPedido, [valor_total]);
        const id_pedido = resultadoPedido.lastID;

        // 2. Insere os itens
        for (const item of itens) {
            await runQuery(
                `INSERT INTO itens_pedido (id_pedido, id_produto, quantidade)
                 VALUES (?, ?, ?)`,
                [id_pedido, item.id_produto, item.quantidade]
            );

            // 3. Atualiza estoque
            await runQuery(
                `UPDATE produtos
                 SET estoque = estoque - ?
                 WHERE id_produto = ?`,

                [item.quantidade, item.id_produto]
            );
        }

        res.status(201).json({
            id_pedido,
            data_criacao: new Date().toISOString().split("T")[0],
            valor_total,
            itens
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllOrders = async (req, res, next) => {
    try {
        const sqlSelectAll = `SELECT * FROM pedidos`;
        const pedidos = await allQuery(sqlSelectAll);
        return res.status(200).json(pedidos);
    } catch (error) {
        next(error);
    }
}

exports.getOrderById = async (req, res, next) => {
    try {
        //valida o id e obtem o idPedido
        const id = await validaIdPedido(req.params.id_pedido);
        const params = [id];
        const sql = `SELECT * FROM pedidos WHERE id_pedido = ?`;
        const pedido = await getQuery(sql, params);

        return res.status(200).json(pedido);
    } catch(error) {
        next(error);
    }
}

// tem como dar um update no pedido?