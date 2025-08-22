const express = require('express');
const app = express();
const port = 8080;

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("static"));

const lista = [
    { nome: "café", categoria: "comida"},
    { nome: "leite", categoria: "comida"}
];

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/login', (req, res) => {
    if (login(req.body.email, req.body.password)) {
        res.redirect("/acesso_liberado.html")
    } else {
        res.send("Acesso negado").status(401);
    }
});

app.post('/produto', (req, res) => {
    if (!nome || !categoria) {
        return res.status(400).send('Informe nome e categoria');
    }

    lista.push(req.body);
    console.log(req.body);
    res.status(201).send("Produto atualizado!");
});

app.get('/view-produtos', (req, res) => {
    res.json(lista);
});

app.listen(port, () => {
    console.log(`API está na porta ${port}`)
});

function login(email, senha) {
    return email === "teste@teste.com" && senha === "123";
}
