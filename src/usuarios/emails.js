const nodemailer = require("nodemailer");

const configuracaoEmailProducao = {
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_USUARIO,
    pass: process.env.EMAIL_SENHA
  },
  secure: true //habilita criptografia TLS
};

const configuracaoEmailTeste = (contaTeste) => ({
  host: 'smtp.ethereal.email',
  auth: contaTeste,
});


async function criaConfiguracaoEmail() {
  if (process.env.NODE_ENV === 'production') {
    return configuracaoEmailProducao;
  } else {
    const contaTeste = await nodemailer.createTestAccount();
    return configuracaoEmailTeste(contaTeste);
  }
}

class Email {
  async enviaEmail() {
    const configuracaoEmail = await criaConfiguracaoEmail();
    const transportador = nodemailer.createTransport(configuracaoEmail);
    const info = await transportador.sendMail(this);
  
    if (process.env.NODE_ENV !== 'production') {
      console.log('URL: ' + nodemailer.getTestMessageUrl(info));
    }
  }
}

class EmailVerificacao extends Email {
  constructor(usuario, endereco){
    super();
      this.from = process.env.EMAIL_USUARIO
      this.to = usuario
      this.subject = 'Confirmação de Cadastro'
      this.text = 'Olá! Clique aqui para validar seu endereço!'
      this.html = `<h1>Olá!</h1> <p>Clique <a href="${endereco}">aqui</a> para validar seu endereço!</p>`
      console.log(endereco)
  }
}

class EmailRedefinicaoSenha extends Email {
  constructor (usuario, token) {
    super()
    this.from = process.env.EMAIL_USUARIO
    this.to = usuario.email
    this.subject = 'Redefinição de Senha'
    this.text = `Olá! Recebemos a sua solicitação para trocar a senha :) Use o token a seguir para trocar a sua senha: ${token}`
    this.html = `<h1>Olá!</h1> Recebemos a sua solicitação para trocar a senha :) Use o token a seguir para trocar a sua senha: ${token}`
    console.log(token)
  }
}

module.exports = { EmailVerificacao, EmailRedefinicaoSenha  };