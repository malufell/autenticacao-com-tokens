const Post = require('./posts-modelo');
const { ControleDeAtributosPost } = require('../controle-de-atributos')

module.exports = {
  adiciona: async (req, res, next) => {
    try {
      const post = new Post(req.body);
      await post.adiciona();
      
      res.status(201).send(post);
    } catch (erro) {
      next(erro)
    }
  },

  //usuário não autenticado visualiza somente os títulos do post e 10 caracteres do conteúdo, seguidos da msg que precisa assinar
  lista: async (req, res, next) => {
    try {
      let posts = await Post.lista()
      const atributosParaExibir = new ControleDeAtributosPost()

      if (!req.estaAutenticado) {
        posts = posts.map(post => {
          post.conteudo = post.conteudo.substr(0, 10) + '... Você precisa assinar o blog para ler o restante do post'
          return post
        })
      }

      res.send(atributosParaExibir.filtrar(posts))
    } catch (erro) {
      next(erro)
    }
  }
};
