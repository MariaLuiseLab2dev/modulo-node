console.log("Hello Wolrd");

// Atividade 1
let valorDaPorcentagem = 10; // 10%
let valorDaConta = 250.00;
let valorDaGorjeta = valorDaConta * (valorDaPorcentagem / 100);
let valorTotal = valorDaConta + valorDaGorjeta; 

console.log(`Gorjeta: R$ ${valorDaGorjeta.toFixed(2)}`);
console.log(`Total com gorjeta: R$ ${valorTotal.toFixed(2)}`);