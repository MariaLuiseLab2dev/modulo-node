-- Criacao tabela usuarios
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL
);

-- Criacao tabela tarefas
CREATE TABLE tarefas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  concluida INTEGER DEFAULT 0,
  usuario_id INTEGER,
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
);

SELECT * FROM tarefas;
SELECT * FROM usuarios;

-- ATIVIDADE 1 
CREATE TABLE category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE product (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  category_id INTEGER,
  FOREIGN KEY(category_id) REFERENCES category(id)
);

INSERT INTO category VALUES (1, 'vegetais');
INSERT INTO category VALUES (2, 'enlatados');
INSERT INTO category VALUES (3, 'frutas');
INSERT INTO category (name) VALUES ('laticínios');

SELECT * FROM category;

INSERT INTO product VALUES (1, 'maçã', 500, 3);
INSERT INTO product VALUES (2, 'chuchu', 400, 1);
INSERT INTO product VALUES (3, 'lata de milho', 800, 2);

SELECT * FROM product;

-- ATIVIDADE 2
-- nome do produto, quantidade e o nome da categoria
SELECT 
    product.name,
    product.quantity,
    category.name AS categoria
FROM 
    product
    INNER JOIN
    category
ON product.category_id = category.id;

-- ATIVIDADE 3
INSERT INTO product (name, quantity) VALUES ('banana', 500);
INSERT INTO product (name, quantity) VALUES ('pão', 600); 

INSERT INTO category (name) VALUES ('açougue'); 
INSERT INTO category (name) VALUES ('higiene'); 

-- mostre todos os produtos que não têm uma categoria
SELECT * FROM product
WHERE category_id IS NULL;

-- mostre todas as categorias que não têm um produto relacionado
SELECT
    category.id,
    category.name,
    product.category_id
FROM 
    category
    LEFT JOIN
    product
ON product.category_id = category.id
WHERE product.category_id IS NULL;
