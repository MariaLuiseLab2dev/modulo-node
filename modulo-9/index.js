// index.js
const cors = require('cors');
const express = require('express');
const app = express();
const tarefaRoutes = require('./routes/tarefas');
const usuarioRoutes = require('./routes/usuarios');

app.use(express.json());
app.use(express.static("static")); 
app.use(cors()); // permite todas as origens

const logMiddleware = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next(); // passa pro próximo middleware ou rota
};

app.use(logMiddleware);

// Montar as rotas de tarefas sob o prefixo /tarefas
app.use('/tarefas', tarefaRoutes);
app.use('/usuarios', usuarioRoutes);

const port = 3000;
const hostname = '127.0.0.1';

app.listen(port, () => {
  console.log(`API está na porta ${port} e rodando em  http://${hostname}:${port}/`);
});
