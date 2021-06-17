require('dotenv').config();

const app = require('./app');
const port = 3000;
require('./database');
require('./redis/blocklist-access-token');
require('./redis/allowlist-refresh-token');
const { InvalidArgumentError, NotFound, Unauthorized } = require('./src/erros');
const jwt = require('jsonwebtoken');

app.use((req, res, next) => {
    res.set({
        'Content-Type': 'application/json'
    })
    next()
});

const routes = require('./rotas');
routes(app);


app.use((erro, req, res, next) => {
    let status = 500;
    const corpo = { mensagem: erro.message };

    if (erro instanceof InvalidArgumentError) {
        status = 400;
    }

    if (erro instanceof jwt.JsonWebTokenError || erro instanceof Unauthorized) {
        status = 401;
    }

    if (erro instanceof NotFound) {
        status = 404;
    }

    if (erro instanceof jwt.TokenExpiredError) {
        status = 401;
        corpo.expiradoEm = erro.expiredAt;
    }

    res.status(status).json(corpo);
});



app.listen(port, () => console.log(`App listening on port ${port}`));
