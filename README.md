## Autenticação com tokens (access token e refresh token)

### Sobre o projeto:

API em node.js, com express, sqlite3, redis, bcrypt, jsonwebtoken, passport-http-bearer, passport-local, nodemailer.

- Implementa cadastro de usuários com proteção das senhas no banco de dados usando o bcrypt
- Implementa autenticação local com passport, sem sessões, para login com usuário e senha
- Gera JSON Web Tokens (jwt) com tempo de expiração de 15 minutos para proteção das rotas autenticadas (access token)
- Implementa estratégia de autenticação dos tokens com passport-http-bearer 
- Implementa logout de usuários, invalidando os tokens através da blocklist salva no Redis
- Implementa atualização do access token através de um refresh token (para que o usuário não precise fazer login a cada 15min)
- Implementa validação do refresh token através de uma allowlist salva no Redis 
- Implementa Nodemailer para confirmação de cadastro de usuários por email, onde a URL para validação também é composta por um token jwt exclusivo
- Rotas protegidas com autenticação por tokens: `.post('/post')`, `.delete('/usuario/:id')`
- Arquivo completo de rotas disponível no .json do Postman salvo na raiz do projeto

<br>

Fluxo básico da autenticação no projeto:

- usuário realiza login e recebe access token e refresh token na resposta
- access token irá expirar em 15 minutos, refresh token irá expirar em 5 dias
- usuário envia uma requisição para uma rota autenticada:
  - com o access token dentro do prazo de 15 minutos, a resposta é liberada pelo servidor
  - com o access token expirado, mas o refresh token ainda válido, o usuário atualizará os dois tokens através da rota `'/usuario/atualiza_token'`. Com os dois tokens novos, o acesso continua sendo realizado normalmente
  - se os dois tokens estiverem expirados, será necessário realizar login novamente

### Como executar:

Pré-requisitos: instalação do node.js e do redis.

1. No terminal, clonar o projeto: `git clone https://github.com/malufell/autenticacao-com-tokens.git`
2. Entrar na pasta do projeto: `cd autenticacao-com-tokens`
3. Instalar as dependências: `npm install`
4. Criar arquivo '.env' na raiz do projeto, com as variáveis de exemplo disponíveis no arquivo '.env-example'
5. Com o redis rodando, iniciar a aplicação: `npm start`
6. O sqlite irá criar as tabelas de "usuários" e "posts", então já é possível criar um usuário acessando "localhost:3000/usuario" com o método http post
7. Na raiz do projeto há o arquivo "Autenticacao Tokens JWT.postman_collection.json" com todas as rotas e exemplos, basta importar no Postman 
8. Ao enviar uma requisição de criação de posts ou deleção de usuários, o token informado na resposta de login deve ser incluído no cabeçalho "Authorization" da requisição, com a indicação 'bearer' antes do token, exemplo: 
```console 
bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ7.eyJpZCI6MiwiaWF0IjoxNjIzMzYyMDQ1LCJleHAiOjE2MjMzNjI5NDV9.I41YgT8BCSF6z6nd0HfzE0FJS_d8kXvYHdsnbAq8O5Y
``` 

<br>

Obs.: uma senha segura para a assinatura do token pode ser gerada com o 'crypto' do node.js: 
```javascript
console.log(require('crypto').randomBytes(256).toString('base64'))`
```

### Funcionamento básico do JWT (JSON Web Token):

- servidor cria o token composto por cabeçalho, payload e assinatura, codificados na Base64, e envia para o usuário
- essa assinatura é composta por uma senha secreta que é guardada apenas no servidor
- no momento que o usuário envia o token junto com a requisição, o servidor divide ele nas três partes: cabeçalho, payload, assinatura
- o servidor usa o mesmo algoritmo para gerar uma assinatura, a partir do cabeçalho e do payload que o usuário enviou
- nesse processo, ele usa a senha que só o servidor tem para fazer uma comparação: se a assinatura ideal é igual a assinatura que usuário enviou para ele
- se as assinaturas são iguais, o token foi emitido pelo próprio servidor
