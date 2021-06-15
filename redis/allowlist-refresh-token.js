const redis = require("redis");
const manipulaLista = require("./manipula-lista");
const allowlist = redis.createClient({ prefix: "allowlist-refresh-token:" });

module.exports = manipulaLista(allowlist); //assim devolvo todos os métodos de 'manipulaLista' aplicados a allowlist