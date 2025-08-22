const prompt = require("prompt");

// Atividade 1
function calculadoraGorjetas() {
    prompt.start();

    return new Promise((resolve, reject) => {
        prompt.get([ 
            { // cria as propriedades
                name: "conta",
                description: "Digite o valor da conta",
                required: true,
                type: "string",
                pattern: /^\d+(\.\d+)?$/,
                message: "Por favor, insira um número válido."
            },
            {
                name: "porcentagem",
                description: "Digite a porcentagem da gorjeta",
                required: true,
                type: "string",
                pattern: /^\d+(\.\d+)?$/,
                message: "Por favor, insira uma porcentagem válida."
            }
        ],
            (err, result) => {
                if (err) {
                    console.error("Erro:", err);
                    reject(err);
                    return;
                } else {
                    let valorDaConta = Number(result.conta);
                    let valorDaPorcentagem = Number(result.porcentagem);

                    let valorDaGorjeta = valorDaConta * (valorDaPorcentagem / 100);
                    let valorTotal = valorDaConta + valorDaGorjeta;
                    console.log(`Gorjeta: R$ ${valorDaGorjeta.toFixed(2)}`);
                    console.log(`Total com gorjeta: R$ ${valorTotal.toFixed(2)}`);
                    resolve(result);
                }
            });
    });
}

module.exports = {calculadoraGorjetas}