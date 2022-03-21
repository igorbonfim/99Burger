const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "cardapio"
});

db.connect(function (err){
    if(err){
        console.log("Erro ao conectar com o banco: " + err.message);
    }
});

module.exports = db;