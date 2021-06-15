const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const allowlist = require("../../redis/allowlist-refresh-token");
const blocklist = require("../../redis/blocklist-access-token");
const { InvalidArgumentError } = require("../erros");

function criaAccesToken(id, [tempoQuantidade, tempoUnidade]) {
  const payload = { id };
  const token = jwt.sign(payload, process.env.CHAVE_JWT, { expiresIn: tempoQuantidade + tempoUnidade });
  return token;
};

async function criaRefreshToken(id, tempoExpiracaoEmMilissegundos) {
  const dataExpiracao = Date.now() + tempoExpiracaoEmMilissegundos;
  const tokenOpaco = crypto.randomBytes(24).toString('hex');
  await allowlist.adiciona(tokenOpaco, id, dataExpiracao)
  return tokenOpaco;
};

async function verificaRefreshToken(token) {
  const id = await allowlist.buscaValor(token);

  if (!token) { //pode vir undefined do front/client
    throw new InvalidArgumentError("Token não enviado!");
  }
  if (!id) {
    throw new InvalidArgumentError("Token inválido!");
  }

  return id;
};

async function verificaAccessToken(token) {
  const tokenNaBlocklist = await blocklist.contemToken(token);
  if (tokenNaBlocklist) {
    throw new jwt.JsonWebTokenError('Token inválido por logout');
  }

  const { id } = jwt.verify(token, process.env.CHAVE_JWT);
  return id;
};

async function invalidaAccessToken(token) {
  await blocklist.adiciona(token);
};

async function invalidaRefreshToken(token) {
  await allowlist.deleta(token);
};

//o uso do this é permitido nessa sintaxe
module.exports = {
  access: {
    expiracao: [15, 'm'],
    cria(id) {
      return criaAccesToken(id, this.expiracao)
    },
    verifica(token) {
      return verificaAccessToken(token);
    },
    invalida(token) {
      return invalidaAccessToken(token);
    },
  },
  refresh: {
    expiracao: 432000000, //cincoDiasEmMilissegundos
    cria(id) {
      return criaRefreshToken(id, this.expiracao)
    },
    verifica(token) {
      return verificaRefreshToken(token);
    },
    invalida(token) {
      return invalidaRefreshToken(token);
    }
  },
  verificacaoEmail: {
    expiracao: [1, 'h'],
    cria(id) {
      return criaAccesToken(id, this.expiracao);
    },
    verifica(token) {
      return verificaAccessToken(token)
    },
  }
};