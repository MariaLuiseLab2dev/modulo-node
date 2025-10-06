CREATE TABLE categorias (
    id_categoria        INTEGER     PRIMARY KEY AUTOINCREMENT,
    nome                TEXT        NOT NULL,
    nome_normalizado    TEXT        UNIQUE,
    status              INTEGER     NOT NULL DEFAULT 1
);

CREATE TABLE produtos (
    id_produto          INTEGER     PRIMARY KEY AUTOINCREMENT,
    nome                TEXT        UNIQUE NOT NULL,
    nome_normalizado    TEXT        NOT NULL,
    descricao           TEXT        NOT NULL,
    preco               REAL        NOT NULL,
    estoque             INTEGER     NOT NULL,
    status              INTEGER     NOT NULL DEFAULT 1,
    id_categoria        INTEGER,
    FOREIGN KEY (id_categoria)  REFERENCES categorias (id_categoria)
);

CREATE TABLE pedidos (
    id_pedido       INTEGER     PRIMARY KEY AUTOINCREMENT,
    data_criacao    DATE        DEFAULT (datetime('now')),
    valor_total     REAL        NOT NULL
);

select * FROM produtos;

CREATE TABLE itens_pedido (
    id_item     INTEGER     PRIMARY KEY AUTOINCREMENT,
    id_pedido   INTEGER,
    id_produto  INTEGER,
    quantidade  INTEGER     CHECK (quantidade > 0),
    preco_unitario  REAL    NOT NULL,
    subtotal        REAL    NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);

CREATE TABLE carrinhos (
    id_carrinho INTEGER PRIMARY KEY AUTOINCREMENT,
    data_criacao DATE DEFAULT (datetime('now'))
);

drop table carrinhos;

CREATE TABLE itens_carrinho (
    id_item     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_carrinho INTEGER NOT NULL,
    id_produto  INTEGER NOT NULL,
    quantidade  INTEGER NOT NULL CHECK (quantidade > 0),
    preco       REAL,
    FOREIGN KEY (id_carrinho) REFERENCES carrinhos(id_carrinho),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)
);

SELECT * FROM itens_carrinho WHERE id_carrinho = 1;
UPDATE itens_carrinho
        SET quantidade = 5, preco = 150.50
        WHERE id_carrinho = 1;
INSERT INTO categorias (nome, nome_normalizado, status) VALUES ('móveis','moveis',1);

select * from produtos;

PRAGMA table_info(itens_carrinho);

SELECT
  (
    SELECT COUNT(*) 
    FROM categorias 
    WHERE nome_normalizado = 'eletrodomesticos'
  )
  OR
  (
    SELECT COUNT(*) 
    FROM produtos 
    WHERE nome_normalizado = 'produtoa'
  )
  AS qtd;

    SELECT
        (
        SELECT COUNT(*) 
        FROM categorias 
        WHERE nome_normalizado = 'moveis'
            AND id_categoria IS NOT 12
        )
    OR
        (
        SELECT COUNT(*) 
        FROM produtos 
        WHERE nome_normalizado = ?
            AND id_categoria IS NOT ?
        )
    AS qtd;
select * from categorias;

SELECT *
        FROM categorias 
        WHERE id_categoria IS NOT 12;

 SELECT SUM(estoque) AS totalEstoque
    FROM produtos
    WHERE id_categoria = 12

INSERT INTO carrinhos DEFAULT VALUES;
INSERT INTO itens_carrinho (id_carrinho, id_produto, quantidade, preco) VALUES (1, 5, 2, 55.9);
SELECT * FROM carrinhos;

SELECT * FROM itens_carrinho;

SELECT 
       ic.id_item,
       ic.id_carrinho,
       ic.id_produto,
       ic.quantidade,
       ic.preco,
       p.nome
FROM itens_carrinho AS ic
JOIN produtos AS p 
ON ic.id_produto = p.id_produto
WHERE ic.id_carrinho = 1;


SELECT 
    p.id_produto,
    p.nome,
    p.descricao,
    p.preco,
    p.estoque,
    p.status,
    p.id_categoria,
    c.nome AS nome_categoria
FROM produtos p
JOIN categorias c 
ON p.id_categoria = c.id_categoria
ORDER BY p.id_produto ASC;

SELECT
    p.id_pedido,
    p.data_criacao,
    p.valor_total,
    ip.quantidade
FROM pedidos p
JOIN itens_pedido ip 
ON p.id_pedido = ip.id_pedido
ORDER BY p.id_pedido ASC;

SELECT * FROM pedidos;

SELECT 
    p.id_pedido,
    p.data_criacao,
    p.valor_total,
    i.id_item,
    i.quantidade,
    i.preco_unitario,
    i.subtotal,
    pr.id_produto,
    pr.nome AS nome_produto,
    pr.descricao,
    pr.preco
FROM pedidos p
JOIN itens_pedido i ON p.id_pedido = i.id_pedido
JOIN produtos pr ON i.id_produto = pr.id_produto
WHERE p.id_pedido = 1;

PRAGMA table_info(pedidos);

SELECT id_pedido, valor_total
FROM pedidos
WHERE valor_total >= 100;
