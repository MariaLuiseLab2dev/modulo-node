--Criar tabelas
CREATE TABLE Clientes (
  id_cliente INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  cidade TEXT,
  idade INTEGER
);

CREATE TABLE Pedidos (
    id_pedido INTEGER PRIMARY KEY,
    id_cliente INTEGER,
    data_pedido DATE,
    valor REAL,
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente)
);

CREATE TABLE Produtos (
    id_produto INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    preco REAL
);

CREATE TABLE Itens_Pedido (
    id_item INTEGER PRIMARY KEY,
    id_pedido INTEGER,
    id_produto INTEGER,
    quantidade INTEGER,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido),
    FOREIGN KEY (id_produto) REFERENCES Produtos(id_produto)
);

-- Inserir dados
INSERT INTO Clientes (nome, cidade, idade) VALUES('Ana', 'São Paulo', 30);
INSERT INTO Clientes (nome, cidade, idade) VALUES('Bruno', 'Rio de Janeiro', 25);
INSERT INTO Clientes (nome, cidade, idade) VALUES('Carla', 'São Paulo', 40);
INSERT INTO Clientes (nome, cidade, idade) VALUES('Diego', 'Belo Horizonte', 35);

INSERT INTO Pedidos (id_cliente, data_pedido, valor) VALUES(1, '2025-01-10', 500);
INSERT INTO Pedidos (id_cliente, data_pedido, valor) VALUES(2, '2025-01-15', 200);
INSERT INTO Pedidos (id_cliente, data_pedido, valor) VALUES(1, '2025-02-01', 300);
INSERT INTO Pedidos (id_cliente, data_pedido, valor) VALUES(3, '2025-02-10', 1000);

INSERT INTO Produtos (nome, preco) VALUES('Notebook', 2500);
INSERT INTO Produtos (nome, preco) VALUES('Mouse', 50);
INSERT INTO Produtos (nome, preco) VALUES('Teclado', 120);
INSERT INTO Produtos (nome, preco) VALUES('Monitor', 900);

INSERT INTO Itens_Pedido (id_pedido, id_produto, quantidade) VALUES(1, 1, 1);-- Pedido 1, Notebook
INSERT INTO Itens_Pedido (id_pedido, id_produto, quantidade) VALUES(1, 2, 2);-- Pedido 1, 2 Mouses
INSERT INTO Itens_Pedido (id_pedido, id_produto, quantidade) VALUES(2, 3, 1);-- Pedido 2, 1 Teclado
INSERT INTO Itens_Pedido (id_pedido, id_produto, quantidade) VALUES(3, 2, 1);-- Pedido 3, 1 Mouse
INSERT INTO Itens_Pedido (id_pedido, id_produto, quantidade) VALUES(3, 4, 1);-- Pedido 3, 1 Monitor
INSERT INTO Itens_Pedido (id_pedido, id_produto, quantidade) VALUES(4, 1, 2);-- Pedido 4, 2 Notebooks

-- Selecione os pedidos com o nome do cliente
SELECT 
  p.id_pedido,  -- id do pedido
  c.nome,       -- nome do cliente
  p.data_pedido,-- data do pedido
  p.valor       -- valor do pedido
FROM Pedidos p  -- junte os registros das tabelas pedidos e clientes
INNER JOIN Clientes c
  ON p.id_cliente = c.id_cliente; -- onde todos os clientes que tiverem pedido


-- selecionando itens detalhados do pedido
SELECT
  p.id_pedido, 
  c.nome AS cliente,
  pr.nome AS produto,
  i.quantidade,
  pr.preco,
  (i.quantidade * pr.preco) AS total_item

-- Pegue um item de pedido
-- Encontre o pedido correspondente
-- Encontre o cliente desse pedido
-- Encontre o produto desse item

-- conecta cada item da tabela itens_pedido com seu respectivo pedido
FROM Itens_Pedido i 
JOIN Pedidos p                  
-- onde id_pedido de itens_pedidos for igual ao id_pedido de pedidos
  ON i.id_pedido = p.id_pedido  -- agora temos acesso aos dados do pedido (data, valor, cliente)


-- conecta cada pedido com seu respectivo cliente
JOIN Clientes c
-- onde o id_cliente da tabela Pedidos for igual ao id_cliente da tabela Clientes
  ON p.id_cliente = c.id_cliente -- Agora temos acesso aos dados do cliente (nome, cidade, idade)     

-- Conecta cada item com seu respectivo produto
JOIN Produtos pr
-- Onde o id_produto da tabela Itens_Pedido for igual ao id_produto da tabela Produtos
  ON i.id_produto = pr.id_produto;  -- Agora temos acesso aos dados do produto (nome, preço)

--Para buscar pela data atual
SELECT date();

--Para inserir a data
INSERT INTO alguma_tabela (coluna_data) VALUES (date());

-- Para agrupar as cidades de cliente
SELECT cidade FROM Clientes GROUP BY cidade;

-- Conta TODAS as linhas da tabela (incluindo valores NULL)
SELECT COUNT(*) FROM Clientes;
-- Resultado: 4 (total de clientes)

-- Conta apenas linhas onde a coluna NÃO é NULL
SELECT COUNT(cidade) FROM Clientes;
-- Se algum cliente não tiver cidade, não será contado

-- quantidade de cliente por cidade
SELECT 
  cidade,
  COUNT (cidade) AS quantidade
FROM Clientes
GROUP BY cidade
ORDER BY quantidade DESC

-- QUANTOS PEDIDOS CADA CLIENTE FEZ:
SELECT
   c.nome,
   COUNT(p.id_pedido) AS total_pedidos
FROM Clientes c -- conecta clientes e pedidos
LEFT JOIN Pedidos p -- onde pega todos os pedidos e
   ON c.id_cliente = p.id_cliente -- os id_cliente da tab cliente é igual a id_pedido da tab pedido
GROUP BY c.nome; -- agrupa os pedidos por cliente

-- SOMA TOTAL DE VENDAS POR CIDADE
SELECT
    c.cidade,
    SUM(p.valor) AS total_vendas -- some a coluna valor
FROM Clientes c -- da tabela clientes
JOIN Pedidos p  -- e da tabela pedidos
    ON c.id_cliente = p.id_cliente -- em que cada id_cliente que fez o pedido
GROUP BY c.cidade; -- agrupe por cidade do cliente


-- FAZ A MEDIA DOS VALORES DOS PEDIDOS
SELECT
    AVG(valor) AS media_valor_pedidos
FROM Pedidos;

-- PEGA O PEDIDO MAIS CARO
SELECT
  MAX(valor) AS pedido_mais_caro,
  c.nome
FROM Pedidos p
join Clientes c
on p.id_cliente = c.id_cliente

select DISTINCT nome from Clientes;


-- ATIVIDADE 1
-- Crie um select que traga o nome do cliente maiúsculo e minúsculo, 
-- quantos pedidos cada cliente realizou,
-- quantos produtos diferentes compraram,
-- o valor total gasto,
-- a média,
-- maior e menor de cada pedido,
-- ordernar pelo total gasto do maior para o menor
SELECT 
    UPPER (c.nome) AS nome_maisculo,
    LOWER (c.nome) AS nome_minusculo,
    COUNT(p.id_pedido) AS qtd_pedidos,
    COUNT(DISTINCT pr.id_produto) AS qtd_pedidos_diferentes,
    (pr.preco * i.quantidade) AS valor_total,
    AVG(p.valor) AS media_pedidos,
    MAX(p.valor) AS maior_pedido,
    MIN(p.valor) AS menor_pedido
FROM clientes c
LEFT JOIN pedidos p 
    ON p.id_cliente = c.id_cliente

LEFT JOIN Itens_Pedido i
    ON i.id_pedido = p.id_pedido

LEFT JOIN Produtos pr
    ON i.id_produto = pr.id_produto

GROUP BY c.nome
ORDER BY valor_total DESC;

-- ATIVIDADE 2
-- select que traga o nome da cidade,
-- o produto mais vendido em quantidade
-- o total de unidades desse produto vendidas
-- valor total faturado com esse produto

SELECT
  c.cidade,
  pr.nome AS produto_mais_vendido,
  SUM(i.quantidade) AS quantidade_vendida,
  (pr.preco * i.quantidade) AS valor_total_faturado

FROM clientes c
LEFT JOIN pedidos p 
    ON p.id_cliente = c.id_cliente

LEFT JOIN itens_pedido i
    ON i.id_pedido = p.id_pedido

LEFT JOIN produtos pr
    ON i.id_produto = pr.id_produto
GROUP BY c.cidade, pr.nome
ORDER BY quantidade_vendida DESC, c.cidade;  



-- ATIVIDADE 3
-- select do nome do cliente em maiúsculo,
-- cidade,
-- total gasto pelo cliente,
-- média de gastos da cidade daquele cliente


SELECT
  UPPER(c.nome) AS nome_cliente,
  c.cidade,
  (pr.preco * i.quantidade) AS total_gasto_cliente,
  AVG(pr.preco * i.quantidade)
FROM clientes c
LEFT JOIN pedidos p 
    ON p.id_cliente = c.id_cliente
LEFT JOIN Itens_Pedido i
    ON i.id_pedido = p.id_pedido

LEFT JOIN Produtos pr
    ON i.id_produto = pr.id_produto
GROUP BY c.nome;


-- ATIVIDADE 4
-- select que retorne o nome do produto em minúsculo, 
-- quantos pedidos ele apareceu, 
-- quantidade total vendida, 
-- valor médio gasto quando esse produto foi comprado, 
-- maior e menor valor de pedido que ele apareceu

SELECT
  LOWER(pr.nome) AS produto_nome,
  COUNT(pr.nome) AS produto_em_pedidos,
  SUM(i.quantidade) AS qtd_total_vendida,
  AVG(pr.preco * i.quantidade) AS valor_medio_gasto,
  MIN(p.valor) AS menor_valor_pedido,
  MAX(p.valor) AS maior_valor_pedido
FROM clientes c
LEFT JOIN pedidos p 
    ON p.id_cliente = c.id_cliente

LEFT JOIN Itens_Pedido i
    ON i.id_pedido = p.id_pedido

JOIN Produtos pr
    ON i.id_produto = pr.id_produto

GROUP BY pr.nome;

SELECT
  pr.nome,
  pr.preco
FROM clientes c
LEFT JOIN pedidos p 
    ON p.id_cliente = c.id_cliente

LEFT JOIN Itens_Pedido i
    ON i.id_pedido = p.id_pedido

JOIN Produtos pr
    ON i.id_produto = pr.id_produto
WHERE c.nome = 'Ana';

SELECT 
  (p.valor) AS soma_pedidos_por_cidade
FROM clientes c
LEFT JOIN pedidos p 
    ON p.id_cliente = c.id_cliente

LEFT JOIN Itens_Pedido i
    ON i.id_pedido = p.id_pedido

JOIN Produtos pr
    ON i.id_produto = pr.id_produto
WHERE c.cidade = 'São Paulo';

-- SELECIONE O NOME DO PRODUTO E O PRECO Q N APARECE EM PEDIDO 
SELECT
  pr.nome,
  pr.preco
   
FROM produtos pr
LEFT JOIN itens_pedido i
    ON pr.id_produto = i.id_produto
WHERE i.id_produto IS NULL;

INSERT INTO produtos VALUES (5, 'Headphone', 200);

SELECT * FROM itens_pedido;

-- Liste todos os clientes que nunca fizeram um pedido
SELECT 
  c.nome,
  c.cidade,
  c.idade
FROM 
  clientes c
  LEFT JOIN
  pedidos p
  ON p.id_cliente = c.id_cliente
WHERE p.id_cliente IS NULL;

INSERT INTO clientes VALUES (5, 'Rogério', 'Salvador', 28);
SELECT * FROM PRODUTOS;

-- Cliente que comprou um produto específico
SELECT 
  c.nome,
  c.cidade,
  p.data_pedido,
  i.quantidade
FROM clientes c
LEFT JOIN pedidos p 
    ON p.id_cliente = c.id_cliente

LEFT JOIN itens_pedido i
    ON i.id_pedido = p.id_pedido

LEFT JOIN Produtos pr
    ON i.id_produto = pr.id_produto
WHERE pr.nome = 'Notebook';


-- valor total gasto por cliente
SELECT
  c.nome,
  c.cidade,
  SUM(i.quantidade * pr.preco) AS valor_total
FROM clientes c
LEFT JOIN pedidos p 
    ON p.id_cliente = c.id_cliente

LEFT JOIN itens_pedido i
    ON i.id_pedido = p.id_pedido

LEFT JOIN Produtos pr
    ON i.id_produto = pr.id_produto
GROUP BY c.nome;

-- liste três clientes com maior gasto, nome, cidade e o total
SELECT 
  c.nome,
  c.cidade,
  SUM(pr.preco * i.quantidade) AS gasto
  
FROM clientes c 
LEFT JOIN pedidos p
  ON p.id_cliente = c.id_cliente

LEFT JOIN itens_pedido i
  ON i.id_pedido = p.id_pedido

LEFT JOIN produtos pr
  ON i.id_produto = pr.id_produto
GROUP BY c.nome
ORDER BY gasto DESC
LIMIT 3; -- tres maiores

SELECT * FROM PRODUTOS;

-- selecione todos os produtos que foram comprados por todos os clientes, nome e a qtd total vendida do produto
SELECT
  pr.nome,
  pr.preco

FROM produtos pr
LEFT JOIN  itens_pedido i
  ON pr.id_produto = i.id_produto;


-- cliente mais fiel + pedidos, nome do cliente, cidade, qtd e pedidos, data do 1º e útlimo pedido
SELECT
  c.nome,
  c.cidade,
  COUNT (i.quantidade) AS qtd,
  MIN(p.data_pedido) AS menor_data,
  MAX(p.data_pedido) AS maior_data

FROM clientes c 
LEFT JOIN pedidos p
  ON p.id_cliente = c.id_cliente

LEFT JOIN itens_pedido i
  ON i.id_pedido = p.id_pedido

LEFT JOIN produtos pr
  ON i.id_produto = pr.id_produto
GROUP BY c.nome
ORDER BY qtd DESC
LIMIT 1;

