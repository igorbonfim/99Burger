const express = require("express");
const cors = require("cors");
const db = require("./config/database.js");
const res = require("express/lib/response");

const app = express();

// Middleware JSON
app.use(express.json());

// Middleware CORS
app.use(cors());

// Rotas
app.get("/produtos/cardapio", function (request, response) {

    let ssql = "SELECT PC.DESCRICAO AS categoria, P.*  FROM PRODUTO P " +
        "JOIN PRODUTO_CATEGORIA PC " +
        "ON P.ID_CATEGORIA = PC.ID_CATEGORIA " +
        "ORDER BY PC.ORDEM";

    db.query(ssql, function (err, result) {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(200).json(result);
        }
    })
});

app.post("/pedidos", function (request, response) {

    db.beginTransaction(function (err) {
        let ssql =  "insert into pedido(id_usuario, dt_pedido, vl_subtotal, vl_entrega, vl_total, status) " +
                    "values(?, current_timestamp(), ?, ?, ?, 'A') ";

        db.query(ssql, [request.body.id_usuario, request.body.vl_subtotal,
        request.body.vl_entrega, request.body.vl_total], function (err, result) {

            if (err) {
                db.rollback();
                response.status(500).json(err);
            } else {
                var id_pedido = result.insertId;

                if (id_pedido > 0) {
                    const itens = request.body.itens;
                    var values = [];

                    for (var i = 0; i < itens.length; i++) {
                        value.push([id_pedido, itens[i].id_produto, itens[i].qtd, itens[i].vl_unitario, itens[i].vl_total]);
                    }

                    ssql =  "insert into pedido(id_usuario, dt_pedido, vl_subtotal, vl_entrega, vl_total, status) " +
                            "values ? ";

                    db.query(ssql, [values], function (err, result) {
                        if (err) {
                            db.rollback();
                            response.status(500).json(err);
                        } else {
                            db.commit();
                            response.status(201).json({ id_pedido: id_pedido })
                        }
                    });
                }
            }
        });
    });
});

app.get("/pedidos", function (request, response) {

    let ssql =  "SELECT P.ID_PEDIDO, P.STATUS, P.DT_PEDIDO, " +
                "DATE_FORMAT(P.DT_PEDIDO, '%d/%m/%Y %H:%i:%s') as DT_PEDIDO, " +
                "P.VL_TOTAL, count(*) as QTD_ITEM " +
                "FROM PEDIDO P  " +
                "JOIN PEDIDO_ITEM I ON (I.ID_PEDIDO = P.ID_PEDIDO) " +
                "GROUP BY P.ID_PEDIDO, P.STATUS, P.DT_PEDIDO, P.VL_TOTAL ";

    db.query(ssql, function (err, result) {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(200).json(result);
        }
    })

});

app.get("/pedidos/itens", function (request, response) {
    /*
    let ssql = "SELECT PC.DESCRICAO AS categoria, P.*  FROM PRODUTO P " +
               "JOIN PRODUTO_CATEGORIA PC " +
               "ON P.ID_CATEGORIA = PC.ID_CATEGORIA " +
               "ORDER BY PC.ORDEM";
    
    db.query(ssql, function(err, result) {
        if (err) {
            return response.status(500).send(err);
        } else {
            return response.status(200).json(result);
        }
    })  
    */
});

app.get("/configs", function (request, response) {

    let ssql = "SELECT * FROM CONFIG";

    db.query(ssql, function (err, result) {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(200).json(result);
        }
    })

});

app.put("/pedidos/status/:id_pedido", function (request, response) {
    
    let ssql = "UPDATE PEDIDO SET STATUS = ? WHERE ID_PEDIDO = ?";
    
    db.query(ssql, [request.body.status, request.params.id_pedido], function(err, result) {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(200).json({id_pedido: request.params.id_pedido});
        }
    })
});

app.listen(3000, function () {
    console.log("Servidor executando na porta 3000");
});