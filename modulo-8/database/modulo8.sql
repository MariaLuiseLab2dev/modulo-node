CREATE TABLE tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    concluida INTEGER DEFAULT 0,
    usuario_id INTEGER,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
);

SELECT * FROM tarefas;

INSERT INTO tarefas (titulo,descricao) VALUES ('estudar Java', 'joins, ddl e dml');

CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL
);

INSERT INTO usuarios (nome) VALUES ('maria');
SELECT * FROM usuarios;

drop table tarefas;

-- Atividade 1 
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL
);

INSERT INTO products (name, price) VALUES ('tripé', 200);

SELECT * FROM products;

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quantity INTEGER,
    created_at TEXT,
    prod_id INTEGER,
    FOREIGN KEY (prod_id) REFERENCES products(id)
);

INSERT INTO orders (quantity, created_at, prod_id) VALUES (10, '2025-02-03', 7);

SELECT
    orders.id,
    orders.quantity,
    orders.created_at,
    orders.prod_id,
    products.name
FROM
    products
	INNER JOIN
	orders
ON products.id = orders.prod_id;

SELECT * FROM orders;

UPDATE orders SET quantity = 50 WHERE id = 2;