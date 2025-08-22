//Atividade 2
// Crie um arquivo calculadora.js que faça operações básicas de matemática. 
// Utilize uma função para isso.


function calcularOperacoes(number1, number2) {

    let op = '+';
    let resultado = 0;

    switch (op.trim()) {
        case '+':
            resultado = number1 + number2;
            break;
        case '-':
            resultado = number1 - number2;
            break;
        case '*':
            resultado = number1 * number2; 
            break;
        case '/':
            if (number2 === 0) {
                console.log("\nErro: divisão por zero.");
                return;
            }
            resultado = number1 / number2;
            break;
        default:
            console.log("Operação inválida.");
            return;
    }
    console.log("Resultado: ", resultado);
}

calcularOperacoes(2,4);