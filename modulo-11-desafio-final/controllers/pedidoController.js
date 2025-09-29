const { runQuery, getQuery, allQuery } = require('../database/database-helper');
const { validarPedido, validaIdPedido, formatarHorario } = require('../utils/utils-helper');

exports.createOrder = async (req, res, next) => {
    try {
        const { itens } = await validarPedido(req.body);

        const valor_total = itens.reduce((acc, item) => {
            return acc + (item.quantidade * item.preco_unitario);
        }, 0);

        // Insere o pedido
        const sqlInsertPedido = `INSERT INTO pedidos (valor_total) VALUES (?)`;
        const resultadoPedido = await runQuery(sqlInsertPedido, [valor_total]);
        const id_pedido = resultadoPedido.lastID; //pego o id criado

        // Insere os itens
        for (const item of itens) {
            const subtotal = item.quantidade * item.preco_unitario;

            await runQuery(
                `INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                [id_pedido, item.id_produto, item.quantidade, item.preco_unitario, subtotal]
            );

            // Atualiza estoque
            await runQuery(
                `UPDATE produtos
                 SET estoque = estoque - ?
                 WHERE id_produto = ?`,

                [item.quantidade, item.id_produto]
            );
        }

        res.status(201).json({
            id_pedido,
            data_criacao: new Date().toISOString(),
            valor_total,
            itens
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllOrders = async (req, res, next) => {
    try {
        const sqlSelectAll = `
        SELECT
            p.id_pedido,
            p.data_criacao,
            p.valor_total,
            ip.quantidade
        FROM pedidos p
        JOIN itens_pedido ip 
        ON p.id_pedido = ip.id_pedido
        ORDER BY p.id_pedido ASC
`;
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
    } catch (error) {
        next(error);
    }
}