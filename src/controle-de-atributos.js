class ControleDeAtributos {
  converter (dados, camposExtras) {
    if (camposExtras.indexOf('*') === -1) { //no controle de acesso, quem pode ver tudo fica com os atributos assim: '[*]'
        dados = this.filtrar(dados)
    }
    return dados;
  }

  filtrar(dados) {
    if (Array.isArray(dados)) {
      dados = dados.map((item) => this.filtrarObjeto(item));
    } else {
      dados = this.filtrarObjeto(dados);
    }

    return dados;
  }

  filtrarObjeto(objeto) {
    const objetoFiltrado = {};

    this.camposPublicos.forEach((campo) => {
      if (Reflect.has(objeto, campo)) {
        objetoFiltrado[campo] = objeto[campo];
      }
    });

    return objetoFiltrado;
  }
}

class ControleDeAtributosPost extends ControleDeAtributos {
    constructor (camposExtras = []) {
        super()
        this.camposPublicos = ['titulo', 'conteudo'].concat(camposExtras)
    }
}

class ControleDeAtributosUsuario extends ControleDeAtributos {
    constructor (camposExtras = []) {
        super()
        this.camposPublicos = ['nome'].concat(camposExtras)
    }
}

module.exports = { ControleDeAtributosPost, ControleDeAtributosUsuario };