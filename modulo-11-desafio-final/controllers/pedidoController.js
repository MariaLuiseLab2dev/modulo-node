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

// Exporta a função getAllOrders para ser usada nas rotas
exports.getAllOrders = async (req, res, next) => {
    try {
        // Desestrutura os filtros enviados via query string (ex: /pedidos?valorMin=100)
        const { dataInicial, dataFinal, valorMin, valorMax } = req.query;

        // Monta o início da query SQL, selecionando pedidos e contando itens
        let sql = `
            SELECT
                p.id_pedido,              -- id do pedido
                p.data_criacao,           -- data de criação do pedido
                p.valor_total,            -- valor total do pedido
                COUNT(ip.id_item) as quantidade -- quantidade de itens no pedido
            FROM pedidos p
            JOIN itens_pedido ip ON p.id_pedido = ip.id_pedido -- join para contar itens
            `;

        // Array que vai guardar os valores dos parâmetros (para evitar SQL injection)
        const params = [];

        // Array que vai guardar as condições do WHERE dinamicamente
        const conditions = [];

        // Se o usuário passou dataInicial, adiciona condição e parâmetro
        if (dataInicial) {
            conditions.push("p.data_criacao >= ?");
            params.push(dataInicial + " 00:00:00"); // concatena hora inicial
        }

        // Se o usuário passou dataFinal, adiciona condição e parâmetro
        if (dataFinal) {
            conditions.push("p.data_criacao <= ?");
            params.push(dataFinal + " 23:59:59"); // concatena hora final
        }

        // Se o usuário passou valorMin, adiciona condição e parâmetro
        if (valorMin) {
            conditions.push("p.valor_total >= ?");
            params.push(parseFloat(valorMin)); // garante que é número
        }

        // Se o usuário passou valorMax, adiciona condição e parâmetro
        if (valorMax) {
            conditions.push("p.valor_total <= ?");
            params.push(parseFloat(valorMax)); // garante que é número
        }

        // Só adiciona WHERE se houver pelo menos uma condição
        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        // Finaliza a query agrupando por pedido e ordenando pela data mais recente
        sql += " GROUP BY p.id_pedido";

        // Executa a query no banco, passando os parâmetros
        const pedidos = await allQuery(sql, params);

        // Converte a data_criacao para formato ISO (padrão internacional)
        const pedidosComISO = pedidos.map(p => ({
            ...p,
            data_criacao: new Date(p.data_criacao).toISOString()
        }));

        // Loga no console a query final e os parâmetros (para debug)
        console.log("SQL:", sql);
        console.log("Params:", params);

        // Retorna os pedidos como JSON na resposta da API
        return res.status(200).json(pedidosComISO);
    } catch (error) {
        // Se der erro, passa para o middleware de tratamento de erros
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
