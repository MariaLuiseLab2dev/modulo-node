require('dotenv').config(); // carrega as variáveis no process.env
const cors = require('cors');
const express = require('express');
const app = express();

const categoryRoutes = require('./routes/categorias');
const productRoutes = require('./routes/produtos');
const orderRoutes = require('./routes/pedidos');

app.use(express.json());
app.use(express.static("static"));
app.use(cors()); // permite todas as origens
app.use('/categorias', categoryRoutes);
app.use('/produtos', productRoutes);
app.use('/pedidos', orderRoutes);

const port = process.env.PORT;
const hostname = process.env.HOSTNAME;


// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);

    const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500;
    const message = err.message || "Erro interno do servidor";

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message
    });
});

//app.listen
app.listen(port, () => {
    console.log(`API está na porta ${port} e rodando em  http://${hostname}:${port}/`);
});