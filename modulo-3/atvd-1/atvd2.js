const prompt = require("prompt");

function calcularOperacoes(num1, num2, op) {
    let resultado;
    switch (op) {
        case "+":
            resultado = num1 + num2;
            break;
        case "-":
            resultado = num1 - num2;
            break;
        case "*":
            resultado = num1 * num2;
            break;
        case "/":
            if (num2 === 0) throw new Error("Divisão por zero");
            resultado = num1 / num2;
            break;
        default:
            throw new Error("Operação inválida");
    }
    return resultado;
}

function calculadora() {
    prompt.start();
    return new Promise((resolve, reject) => {
        prompt.get(
            [
                {
                    name: "number1",
                    description: "Digite o primeiro número",
                    required: true,
                    type:"string",
                    pattern: /^\d+(\.\d+)?$/,
                    message: "Digite apenas números"
                },
                {
                    name: "number2",
                    description: "Digite o segundo número",
                    required: true,
                    type: "string",
                    pattern: /^\d+(\.\d+)?$/,
                    message: "Digite apenas números"
                },
                {
                    name: "op",
                    description: "Qual operação? (+, -, *, /)",
                    required: true,
                    type: "string",
                    pattern: /^[+\-*/]$/,
                    message: "Digite apenas +, -, * ou /"
                }
            ],
            (err, result) => {
                if (err) return reject(err);

                try {
                    console.log(typeof result.number1); // string
                    const n1 = parseFloat(result.number1);
                    const n2 = parseFloat(result.number2);
                    const res = calcularOperacoes(n1, n2, result.op.trim());
                    resolve(res);
                } catch (e) {
                    console.error("Erro:", e.message);
                    reject(e);
                }
            }
        );
    });
}

module.exports = { calculadora };
