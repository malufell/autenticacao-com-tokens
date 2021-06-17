const controle = require('../controle-de-acesso');

//na rota será indicado o nome do método conforme abaixo
//na função abaixo será identificado se o cargo do usuário pode agir sobre 'todos' ou 'apenasSeu'
const metodos = {
  ler: {
    todos: 'readAny',
    apenasSeu: 'readOwn'
  },
  criar: {
    todos: 'createAny',
    apenasSeu: 'createOwn'
  },
  remover: {  
    todos: 'deleteAny',
    apenasSeu: 'deleteOwn'
  }
};

module.exports = (entidade, acao) => (req, res, next) => {
  const permissoesDoCargo = controle.can(req.user.cargo);
  const acoes = metodos[acao] //acao é o metodo do accesscontrol (createOwn, readAny e etc!)
  const permissaoTodos = permissoesDoCargo[acoes.todos](entidade);
  const permissaoApenasSeu = permissoesDoCargo[acoes.apenasSeu](entidade);

  //se ambos forem false, significa que a pessoa não pode fazer nada
  if (permissaoTodos.granted === false && permissaoApenasSeu.granted === false) {
    res.status(403).send(`o cargo ${req.user.cargo} não tem permissão para essa ação`).end();  
    return;
  }

  //se a pessoa tem acesso, abaixo eu informo a quais atributos (essa info vem de 'controle-de-acesso')
  req.acesso = { 
    todos: {
      permitido: permissaoTodos.granted,
      atributos: permissaoTodos.attributes,
    },
    apenasSeu: {
      permitido: permissaoApenasSeu.granted,
      atributos: permissaoApenasSeu.attributes,
    },
  };
  next();
};
