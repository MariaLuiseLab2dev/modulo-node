const prompt = require("prompt");

function conversorDeTemperatura() {
    prompt.start();
    return new Promise((resolve, reject) => {
        prompt.get(
            [
                {
                    name: "tempC",
                    description: "Digite a temperatura em Celsius",
                    required: true,
                    type: "string",
                    pattern: /^\d+(\.\d+)?$/,
                    message: "Por favor, insira uma temperatura válida"
                }
            ],
            (err, result) => {
                if (err) return reject(err);

                const c = result.tempC;
                const f = (c * 9) / 5 + 32;
                console.log(`Temperatura em Fahrenheit: ${f.toFixed(2)}°F`);
                resolve(f);
            }
        );
    });
}

module.exports = { conversorDeTemperatura };
