
// Crie um arquivo chamado temperatura.js, ele deve realizar a conversão de Celsius para Fahrenheit.
function converterCelsiusParaFahrenheit() {
		const tempC = 0;

		if (isNaN(tempC)) {
			console.log("Valor inválido! Digite um número.");
			return;
		}

		const fahrenheit = (tempC * 9/5) + 32;
		console.log(`${tempC.toFixed(2)}°C equivalem a ${fahrenheit.toFixed(2)}°F`);

};

// Chama a função
converterCelsiusParaFahrenheit();
