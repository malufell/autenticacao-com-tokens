const jwt = require("jsonwebtoken");
const { createHash } = require("crypto");
const redis = require("redis");
const blocklist = redis.createClient({ prefix: "blocklist-access-token:" });
const manipulaLista = require('./manipula-lista');
const manipulaBlacklist = manipulaLista(blocklist);

function geraTokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

module.exports = {
  adiciona: async (token) => {
    const dataExpiracao = jwt.decode(token).exp; 
    const tokenHash = geraTokenHash(token);
    await manipulaBlacklist.adiciona(tokenHash, '', dataExpiracao); //inclui o token como chave e deixa o valor vazio
  },
  contemToken: async (token) => {
    const tokenHash = geraTokenHash(token);
    return manipulaBlacklist.contemToken(tokenHash);
  },
};
