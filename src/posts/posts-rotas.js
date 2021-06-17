const postsControlador = require('./posts-controlador');
const { middlewaresAutenticacao } = require('../usuarios');
const autorizacao = require('../middlewares/autorizacao');
const tentativaAutenticacao = require('../middlewares/tentativaAutenticacao');
const tentativaAutorizacao = require('../middlewares/tentativaAutorizacao');

//a rota get que lista os posts vai exibir informações diferentes, com autenticação opcional
//se a pessoa não está autenticada, só vê o título
//se estiver autenticada, vê tudo (não importa o cargo, basta ter feito login)
module.exports = app => {
  app
    .route('/post')
    .get([tentativaAutenticacao, tentativaAutorizacao('post', 'ler')], postsControlador.lista)
    .post([middlewaresAutenticacao.bearer, autorizacao('post', 'criar')], postsControlador.adiciona);
};
