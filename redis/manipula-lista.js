const { promisify } = require("util");

//as funções redis funcionam de forma assíncrona, mas essa versão ainda não suporta promise, por isso o promisify
module.exports = (lista) => {
  const setAsync = promisify(lista.set).bind(lista);
  const existsAsync = promisify(lista.exists).bind(lista);
  const getAsync = promisify(lista.get).bind(lista);
  const delAsync = promisify(lista.del).bind(lista);

  return {
    async adiciona (chave, valor, dataExpiracao) {
      await setAsync(chave, valor); 
      lista.expireat(chave, dataExpiracao); //expira o token no prazo indicado
    },

    async buscaValor(chave) {
      return await getAsync(chave);
    },

    async contemToken(chave) {
      const resultado = await existsAsync(chave); //retorna 1 se a chave estiver na base, e 0 se não estiver
      return resultado === 1;
    },

    async deleta(chave) {
      await delAsync(chave);
    }
  };
};
