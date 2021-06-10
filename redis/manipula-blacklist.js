const blacklist = require("./blacklist");
const jwt = require("jsonwebtoken");
const { createHash } = require("crypto");

//as funções do client “redis”, funcionam de forma assíncrona, mas essa versão ainda não suporta promise, por isso o promisify
const { promisify } = require('util');
const setAsync = promisify(blacklist.set).bind(blacklist);
const existsAsync = promisify(blacklist.exists).bind(blacklist);

function geraTokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

module.exports = {
  adiciona: async (token) => {
    const dataExpiracao = jwt.decode(token).exp; 
    const tokenHash = geraTokenHash(token);
    await setAsync(tokenHash, 'teste'); //inclui o token como chave e deixa o valor vazio
    blacklist.expireat(tokenHash, dataExpiracao) //expira o token no prazo indicado
  },
  contemToken: async (token) => {
    const tokenHash = geraTokenHash(token);
    const resultado = await existsAsync(tokenHash); //retorna 1 se a chave estiver na base, e 0 se não estiver
    return resultado === 1;
  },
};
