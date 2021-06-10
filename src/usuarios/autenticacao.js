const Usuario = require("./usuarios-modelo");
const { InvalidArgumentError } = require("../erros");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const BearerStrategy = require("passport-http-bearer").Strategy;
const jwt = require("jsonwebtoken");
const blacklist = require("../../redis/manipula-blacklist");

function verificaUsuario(usuario) {
  if (!usuario) {
    throw new InvalidArgumentError("E-mail não cadastrado!");
  }
}

async function verificaSenha(senha, senhaHash) {
  const senhaValida = await bcrypt.compare(senha, senhaHash); //bcrypt.compare retorna uma promise
  if (!senhaValida) {
    throw new InvalidArgumentError("Senha inválida");
  }
}

async function verificaTokenNaBlacklist(token) {
  const tokenNaBlacklist = await blacklist.contemToken(token);
  if (tokenNaBlacklist) {
    throw new jwt.JsonWebTokenError('Token inválido por logout');
  }
}

passport.use("local", new LocalStrategy(
    { usernameField: "email", passwordField: "senha", session: false },
    async (email, senha, done) => {
      try {
        const usuario = await Usuario.buscaPorEmail(email);
        verificaUsuario(usuario);
        await verificaSenha(senha, usuario.senhaHash);
        done(null, usuario);
      } catch (erro) {
        done(erro);
      }
    }
  )
);

passport.use('bearer', new BearerStrategy(async (token, done) => {
    try {
      await verificaTokenNaBlacklist(token);
      const payload = jwt.verify(token, process.env.CHAVE_JWT);
      const usuario = await Usuario.buscaPorId(payload.id);
      done(null, usuario, { token: token }); //inclui o token para repassar ao middleware e depois ao controller para logout
    } catch (erro) {
      done(erro);
    }
  })
);
