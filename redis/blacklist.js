const redis = require("redis");

//cria um cliente no redis
//todas as próximas chaves vão estar com o prefixo blacklist e vai estar tudo atrelado com esse cliente específico.
module.exports = redis.createClient({ prefix: "blacklist" });
