const AccessControl = require("accesscontrol");
const controle = new AccessControl();

controle
  .grant("assinante")
  .readAny("post", ["id", "titulo"])
  .readAny('usuario', ['nome'])
//as permissões indicam se o usuário pode editar só aquilo que ele mesmo criou, ou se pode editar o que outros usuários criaram
//tudo que tem 'own' permite que a pessoa edite somente o que é dela
controle
  .grant("editor")
  .extend('assinante')
  .createOwn('post')
  .deleteOwn('post')

//tudo que tem 'any' permite que a pessoa edite tudo, incluindo o que não é dela mesma
controle
  .grant("admin")
  .readAny('post')
  .createAny('post')
  .deleteAny('post')
  .readAny('usuario')
  .deleteAny('usuario')

module.exports = controle;
