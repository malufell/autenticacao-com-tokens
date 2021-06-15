const Usuario = require("./usuarios-modelo");
const { InvalidArgumentError } = require("../erros");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const BearerStrategy = require("passport-http-bearer").Strategy;
const tokens = require("./tokens");

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
      const id = await tokens.access.verifica(token);
      const usuario = await Usuario.buscaPorId(id);
      done(null, usuario, { token: token }); //inclui o token para repassar ao middleware e depois ao controller para logout
    } catch (erro) {
      done(erro);
    }
  })
);
