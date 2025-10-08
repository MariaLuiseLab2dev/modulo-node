class ApiError extends Error { // cria uma classe que extend o Error
    // cria um construtor que sempre vai ter uma mensagem e um statusCode
    constructor(message, statusCode = 500) {  
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
    }
}

class DuplicateError extends ApiError {
    // recebe o nome da tabela e o valor duplicado pra imprimir na msg de erro
    constructor(nomeTabela, valorDuplicado){
        super(`${nomeTabela.toUpperCase()} [${valorDuplicado}] já existe`, 409);
    }
}

class ValidationError extends ApiError {
    // recebe o valor com o tipo errado e a mensagem mais detalhada
    constructor(valorComTipoErrado, detalhe) {
        super(`Campo [${valorComTipoErrado.toUpperCase()}] inválido: ${detalhe}`, 400);
    }
}

class NotFoundError extends ApiError {
    constructor(recurso) {
        const recursoStr = String(recurso).toUpperCase();
        super(`Recurso [${recursoStr}] é obrigatório`, 404);
    }
}

module.exports = {
  DuplicateError,
  ValidationError,
  NotFoundError
};