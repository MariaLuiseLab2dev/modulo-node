const { runQuery, getQuery, allQuery } = require('../database/database-helper');
const { validarPedido, validaIdPedido } = require('../utils/utils-helper');

exports.createOrder = async (req, res, next) => {
    try {
        const { itens } = await validarPedido(req.body);

        // faz a soma total
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
        const { dataInicial, dataFinal, valorMin, valorMax } = req.query;

        let sql = `
            SELECT
                p.id_pedido,
                p.data_criacao,
                p.valor_total,
                COUNT(ip.id_item) as quantidade
            FROM pedidos p
            JOIN itens_pedido ip ON p.id_pedido = ip.id_pedido
            `;
        const params = [];
        const conditions = [];

        if (dataInicial) {
            conditions.push("p.data_criacao >= ?");
            params.push(dataInicial + " 00:00:00");
        }
        if (dataFinal) {
            conditions.push("p.data_criacao <= ?");
            params.push(dataFinal + " 23:59:59");
        }
        if (valorMin) {
            conditions.push("p.valor_total >= ?");
            params.push(parseFloat(valorMin));
        }
        if (valorMax) {
            conditions.push("p.valor_total <= ?");
            params.push(parseFloat(valorMax));
        }

        // só adiciona WHERE se houver condições
        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += " GROUP BY p.id_pedido ORDER BY p.data_criacao DESC";

        const pedidos = await allQuery(sql, params);

        const pedidosComISO = pedidos.map(p => ({
            ...p,
            data_criacao: new Date(p.data_criacao).toISOString()
        }));
        
        console.log("SQL:", sql);
        console.log("Params:", params);

        return res.status(200).json(pedidosComISO);
    } catch (error) {
        next(error);
    }
};


exports.getOrderById = async (req, res, next) => {
    try {
        // valida id
        const id = await validaIdPedido(req.params.id_pedido);

        // busca o pedido
        const sqlPedido = `SELECT * FROM pedidos WHERE id_pedido = ?`;
        const pedido = await getQuery(sqlPedido, [id]);

        // busca os itens + produtos
        const sqlItens = `
            SELECT 
                i.id_item,
                i.quantidade,
                i.preco_unitario,
                i.subtotal,
                pr.id_produto,
                pr.nome AS nome_produto,
                pr.descricao,
                pr.preco
            FROM itens_pedido i
            JOIN produtos pr ON i.id_produto = pr.id_produto
            WHERE i.id_pedido = ?;
            `;
        const itens = await allQuery(sqlItens, [id]);

        // transforma data do pedido para ISO
        const pedidoComISO = {
        ...pedido,
        data_criacao: pedido.data_criacao ? new Date(pedido.data_criacao).toISOString() : null,
        itens 
        };

        // monta resposta
        return res.status(200).json(pedidoComISO);
    } catch (error) {
        next(error);
    }
};
