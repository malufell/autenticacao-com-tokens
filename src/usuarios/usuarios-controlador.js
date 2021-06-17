const Usuario = require('./usuarios-modelo');
const tokens = require('./tokens');
const { EmailVerificacao, EmailRedefinicaoSenha } = require('./emails');
const { NotFound, InvalidArgumentError } = require('../erros');
const { ControleDeAtributosUsuario } = require('../controle-de-atributos')


function geraEndereco(rota, token) {
  const baseURL = process.env.BASE_URL;
  return `${baseURL}${rota}${token}`
}

module.exports = {
  adiciona: async (req, res, next) => {
    const { nome, email, senha, cargo } = req.body;
    try {
      const usuario = new Usuario({ nome, email, emailVerificado: false, cargo });
      await usuario.adicionaSenha(senha);
      await usuario.adiciona();

      const token = tokens.verificacaoEmail.cria(usuario.id);
      const endereco = geraEndereco('usuario/verifica_email/', token);
      const emailVerificacao = new EmailVerificacao(usuario.email, endereco);
      emailVerificacao.enviaEmail().catch(console.log);

      res.status(201).json();
    } catch(erro) {
        next(erro);  
    }
  },

  lista: async (req, res) => {
    const usuarios = await Usuario.lista();

    const atributosParaExibir = new ControleDeAtributosUsuario()
    res.json(atributosParaExibir.converter(usuarios, req.acesso.todos.permitido ? req.acesso.todos.atributos : req.acesso.apenasSeu.atributos))
  },

  verificaEmail: async (req, res, next) => {
    try {
      const usuario = new Usuario(req.user);
      await usuario.modificaEmail();
      res.status(200).send();
    } catch (erro) {
        next(erro);
    }
  },

  deleta: async (req, res, next) => {
    try {
      const usuario = await Usuario.buscaPorId(req.params.id);
      await usuario.deleta();
      res.status(200).send();
    } catch(erro) {
        next(erro);  
    }
  },

  login: async (req, res) => {
    const accessToken = tokens.access.cria(req.user.id);
    const refreshToken = await tokens.refresh.cria(req.user.id);
    res.set('Authorization', accessToken)
    res.status(200).json({ refreshToken });
  },

  logout: async (req, res, next) => {
    try {
      const token = req.token;
      await tokens.access.invalida(token);
      res.status(204).send();
    } catch(erro) { 
        next(erro);
    }
  },

  esqueciMinhaSenha: async (req, res, next) => {
    const respostaPadrao = { mensagem: 'Se encontrarmos um usuário com este email, vamos enviar uma mensagem com as instruções para redefinir a senha' };

    try {
      const usuario = await Usuario.buscaPorEmail(req.body.email);
      const token = await tokens.redefinicaoDeSenha.cria(usuario.id);
      const email = new EmailRedefinicaoSenha(usuario, token);
      await email.enviaEmail();
      res.send(respostaPadrao);

    } catch (erro) {
      if (erro instanceof NotFound) {
        res.send(respostaPadrao)
        return
      }
      next(erro);
    }
  },

  trocaSenha: async (req, res, next) => { 
    try {
      if (typeof req.body.token !== 'string' || req.body.token.lenght === 0) {
        throw new InvalidArgumentError('O token está inválido')
      };
      const id = await tokens.redefinicaoDeSenha.verifica(req.body.token);
      const usuario = await Usuario.buscaPorId(id);
      await usuario.adicionaSenha(req.body.senha);
      await usuario.atualizaSenha();
      res.send({ mensagem: 'Sua senha foi atualizada com sucesso' });

    } catch (erro) {
      next(erro)
    }
  },
};
