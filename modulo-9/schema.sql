--Criacao tabela usuarios
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    senha TEXT NOT NULL
);

--Criacao tabela tarefas
CREATE TABLE tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descricao TEXT,
    concluida INTEGER DEFAULT 0,
    data_criacao TEXT,
    usuario_id INTEGER,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
);

insert into usuarios values (1, 'Usuario A');
insert into usuarios values (2, 'Usuario B');

INSERT INTO tarefas
VALUES (1, 'Aprender SQL', 'Completar esse capítulo do curso.', false, datetime('now'), 1);

INSERT INTO tarefas
VALUES (2, 'Aprender cozinhar', 'Cozinhar sempre é bom', false, datetime('now'), 1);

INSERT INTO tarefas
VALUES (3, 'Uma outra atividade', 'Mais uma atividade',  true,datetime('now'), 2); 

SELECT * FROM usuarios;


