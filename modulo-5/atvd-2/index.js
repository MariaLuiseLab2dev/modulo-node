// Crie uma página HTML com formulário com nome e quantidade de produtos, 
// que envie um submit na rota POST /produtos. 
// Adicione um objeto com esses dois atributos na lista de produto. 
// Depois crie uma rota GET /produtos que mostre todos os produtos e exiba em tela.

const express = require('express');
const app = express();
const port = 8080;
const bodyParser = require('body-parser');
const listOfProducts = [];
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static("static"));

app.post('/product', (req, res) => {
    const product = req.body.product;
    const quantity = req.body.quantity;

    if(!product || !quantity) {
        res.status(400).send("Insira o produto e a quantidade.");
    } else {
        listOfProducts.push({product, quantity});
        res.redirect('/list.html');
    }
    console.log(product);
    console.log(quantity);
});

app.get('/products', (req, res) => {
  res.json(listOfProducts);
});

app.listen(port, () => {
    console.log(`API está na porta ${port} e rodando em http://localhost:8080`);
});

// http