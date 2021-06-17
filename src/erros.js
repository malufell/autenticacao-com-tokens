class InvalidArgumentError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'InvalidArgumentError';
  }
}

class InternalServerError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'InternalServerError';
  }
}

class NotFound extends Error {
    constructor(entidade) {
    const mensagem = `Não foi possível encontrar ${entidade}`
    super(mensagem);
    this.name = 'NotFound';
  }
}

class Unauthorized extends Error {
    constructor() {
    const mensagem = `Não foi possível acessar esse recurso`
    super(mensagem);
    this.name = 'Unauthorized';
  }
}

module.exports = { InvalidArgumentError, InternalServerError, NotFound, Unauthorized };