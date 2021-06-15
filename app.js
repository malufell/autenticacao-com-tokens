const express = require("express");
const app = express();
const { autenticacao } = require("./src/usuarios/autenticacao");

app.use(express.json());

module.exports = app;
