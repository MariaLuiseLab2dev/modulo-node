/** Rotas */
const cors = require('cors');
const express = require('express');
const app = express();
const port = 3000;
const hostname = '127.0.0.1';
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static("static"));
app.use(express.json());

app.use(cors()); // permite todas as origens

const logMiddleware = (req, res, next) => {
    console.log(` ${req.method} ${req.url}`);
    next(); // Passa para o próximo middleware ou rota
};
app.use(logMiddleware);

const messages = {
    errors: {
        MISSING_FIELDS: { message: "Fields 'product' and 'quantity' are requested." },
        PRODUCT_NOT_FOUND: { message: "Product not found." },
        INVALID_QUANTITY: { message: "Provides a valid entry for quantity." }
    },
    success: {
        PRODUCT_CREATED: { message: "Product successfully created." },
        PRODUCT_UPDATED: { message: "Product successfully updated." },
        PRODUCT_PARTIALLY_UPDATED: { message: "Product successfully patched." },
        PRODUCT_DELETED : {message: "Product successfully deleted."}
    }
};

let listOfProducts = [];

app.post('/product', (req, res) => {
    const id = crypto.randomUUID(); // gerar um número aleatório
    const product = req.body.product;
    const quantity = req.body.quantity;

    if(!product || !quantity) {
        return res.status(400)
                    .json(messages.errors.MISSING_FIELDS);
    } else {
        listOfProducts.push({id, product, quantity});
        return res.status(201)
                    .json({ id, ...messages.success.PRODUCT_CREATED });
    }
});

app.get('/products', (req, res) => res.status(200).json(listOfProducts));

app.get('/products/:id', (req, res) => {
    const { id } = req.params;
    const product = listOfProducts.find(p => p.id === id);

    if (!product) return res.status(404).json(messages.errors.PRODUCT_NOT_FOUND);
    return res.json(product);
});

app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { product, quantity } = req.body;

    // Procura na lista qual é o índice do produto com esse id
    const productIdx = listOfProducts.findIndex(p => p.id === id);
    
    // Se não achar, retorna -1
    if (productIdx === -1) return res.status(404)
                                    .json(messages.errors.PRODUCT_NOT_FOUND);

    if(!product || !quantity) return res.status(400)
                                        .json(messages.errors.MISSING_FIELDS);

    // substitui o objeto naquele índice
    listOfProducts[productIdx] = { id, product, quantity};
    return res.status(200)
                .json({ ...listOfProducts[productIdx], 
                    ...messages.success.PRODUCT_UPDATED });
});

app.patch('/products/:id', (req, res) => {
    const { id } = req.params;
    const { product, quantity } = req.body;

    const productIdx = listOfProducts.findIndex(p => p.id === id);
    if (productIdx === -1) return res.status(404).json("Product not found.");

    if (product) {
        listOfProducts[productIdx].product = product;
    }

    if (quantity || quantity == 0) { 
        if(isNaN(quantity) || quantity < 0) {
            return res.status(400).json(messages.errors.INVALID_QUANTITY);
        }
        listOfProducts[productIdx].quantity = quantity;
    }
    return res.status(200).json({ ...listOfProducts[productIdx], ...messages.success.PRODUCT_PARTIALLY_UPDATED });
});

app.delete('/products/:id', (req, res) => {
    const { id } = req.params;

    const product = listOfProducts.find(p => p.id === id);

    if (!product) {
        return res.status(404).json(messages.errors.PRODUCT_NOT_FOUND);
    }
    
    listOfProducts = listOfProducts.filter(p => p.id !== id);

    return res.status(200).json({
        deleted: product,
        ...messages.success.PRODUCT_DELETED
    });
});

app.listen(port, () => {
    console.log(`API está na porta ${port} e rodando em  http://${hostname}:${port}`);
});