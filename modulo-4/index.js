const http = require('http');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3000;

const lista = [
    { nome: "sabonete", categoria: "higiene" },
    { nome: "rímel", categoria: "maquiagem" },
    { nome: "esponja de banho", categoria: "higiene" }
];

const server = http.createServer((req, res) => {
    const urlParseada = url.parse(req.url, true);
    const rota = urlParseada.pathname;
    const parametro = urlParseada.query;

    console.log("Rota acessada:", rota);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

    // Rota principal
    if (rota === "/") {
        res.end("<h1>Olá, mundo!</h1>");

        // Rota /data
    } else if (rota === "/data") {
        const atual = new Date().toString();
        res.end(atual);

        // Rota /produto
    } else if (rota === "/produto") {
        if (parametro.nome) {
            const novoProduto = {
                nome: parametro.nome,
                categoria: parametro.categoria || "não especificada"
            };
            lista.push(novoProduto);
            res.end("Produto adicionado com sucesso.");
        } else {
            res.end("Informe um produto válido, ex: /produto?nome=shampoo&categoria=farmacia");
        }

        // Rota /view-produtos
    } else if (rota === "/view-produtos") {
        res.end(JSON.stringify(lista));

        // Rota /bemvindo
    } else if (rota === "/bemvindo") {
        res.end("<h2>Bem-vindo!</h2>");

        // Rota com parâmetros dinâmicos
    } else if (Object.keys(parametro).length > 0) {
        for (const key in parametro) {
            res.write(`<div><h2>${key} : ${parametro[key]}</h2></div>`);
        }
        res.end();

        // Rota não encontrada
    } else {
        res.end("<h1>Página não encontrada</h1>");
    }
});

server.listen(port, hostname, () => {
    console.log(`Servidor rodando em http://${hostname}:${port}/`);
});
