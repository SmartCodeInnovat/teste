var express = require('express');
var pasth = require('path');
var bcrypt = require('bcrypt');
var router = express.Router();
var db = require("../src/models/dao/eventosDAO");
var collection = require("../src/models/dao/usersDAO");
const fetch = require('node-fetch');
const cors = require('cors');
const { stringify } = require('querystring');
let message = "";
let type = "";
/*codigo api asaas $aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ== */


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get("/descricao/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const doc = await db.findOne(id);
    res.render('descricao', { title: 'Descricao', evento: doc });
  } catch (err) {
    next(err);
  }
});

router.get("/evento/mes/:nome", async (req, res, next) => {
  const nome = req.params.nome;
  try {
    const doc = await db.findMes(nome);
    res.render('evento', { title: 'Evento', evento: doc });
  } catch (err) {
    next(err);
  }
});

router.get("/evento/local/:nome", async (req, res, next) => {
  const nome = req.params.nome;
  try {
    const doc = await db.findLocal(nome);
    res.render('evento', { title: 'Evento', evento: doc });
  } catch (err) {
    next(err);
  }
});

router.get("/evento/acao/:nome", async (req, res, next) => {
  const nome = req.params.nome;
  try {
    const doc = await db.findAcao(nome);
    res.render('evento', { title: 'Evento', evento: doc });
  } catch (err) {
    next(err);
  }
});


router.post("/cadastro", async (req, res) => {
  const data = {
    name: req.body.username,
    email: req.body.email,
    password: req.body.password
  }

  const existingUser = await collection.findOne({ email: data.email });
  if (existingUser) {
    setTimeout(() => { message = "" }, 1000);
    console.log(message);
    message = "Este email já está sendo utilizado!"
    type = "danger";
    res.render("cadastro", { title: "Express", message: message, type: type });
    setTimeout(() => { message = "" }, 2000);
  } else {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword;
    const userdata = await collection.insertMany(data);
    var eventos = await db.getEventos();
    console.log(eventos);
    res.render("evento", { title: "Express", evento: eventos });
  }
});

router.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ email: req.body.email });
    if (!check) {
      message = "Seu e-mail está incorreto!";
      type = "danger";
      res.render("login", { title: "Express", message: message, type: type });
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if (isPasswordMatch) {
      var eventos = await db.getEventos();
      console.log(eventos);
      res.render("evento", { title: "Express", evento: eventos });

    } else {
      message = "Sua senha está incorreta!";
      type = "danger";
      res.render("login", { title: "Express", message: message, type: type });
    }
  } catch {

  }

});

router.post("/pagamento", async (req, res) => {
  //Formatando o CPF para a API
  var cpf = req.body.cpf;
  var cpf2 = cpf.replace('.', '');
  var cpf2 = cpf2.replace('.', '');
  var cpf3 = cpf2.replace('-', '');

  //Se for a primeira vez doando
  if (req.body.situation === "first-time") {
    //Criando o cliente
    let reqs = await fetch("https://sandbox.asaas.com/api/v3/customers", {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ==',
        'content-type': 'application/json'
      },
      body: JSON.stringify(
        {
          "name": req.body.fullname,
          "cpfCnpj": cpf3
        }
      )
    });
    let ress = await reqs.json();

    //Se a opção de pagamento for boleto
    if (req.body.payment === "boleto") {
      let reqs2 = await fetch("https://sandbox.asaas.com/api/v3/payments", {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ==',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          "billingType": "BOLETO",
          "customer": ress.id,
          "value": req.body.am,
          "dueDate": req.body.data
        })
      })
      let ress2 = await reqs2.json();
      res.redirect(ress2.bankSlipUrl);
    } 
    //Se a opção de pagamento for Cartão de Crédito
    else if (req.body.payment === "credit-card") {
      let reqs2 = await fetch("https://sandbox.asaas.com/api/v3/payments", {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ==',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          "billingType": "CREDIT_CARD",
          "customer": ress.id,
          "value": req.body.am,
          "dueDate": req.body.data
        })
      })
      let ress2 = await reqs2.json();
      res.redirect(ress2.invoiceUrl);
    } 
    //Se a opção for PIX
    else {
      let reqs2 = await fetch("https://sandbox.asaas.com/api/v3/payments", {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ==',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          "billingType": "PIX",
          "customer": ress.id,
          "value": req.body.am,
          "dueDate": req.body.data
        })
      })
      let ress2 = await reqs2.json();
      res.redirect(ress2.invoiceUrl);
    }
  } 
  //Se não for a minha primeira vez doando
  else {
    //Procurando cliente pelo CPF
    let reqs = await fetch("https://sandbox.asaas.com/api/v3/customers?cpfCnpj=" + cpf3, {
      method: "GET",
      headers: {
        'accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ==',

      }
    });
    let ressNotFirstTime = await reqs.json();
    console.log(ressNotFirstTime);
    //Se a opção de pagamento for boleto
    if (req.body.payment === "boleto") {
      let reqs2 = await fetch("https://sandbox.asaas.com/api/v3/payments", {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ==',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          "billingType": "BOLETO",
          "customer": ressNotFirstTime.data[0].id,
          "value": req.body.am,
          "dueDate": req.body.data
        })
      })
      let ress2 = await reqs2.json();
      console.log(ress2);
      res.redirect(ress2.bankSlipUrl);
    } 

    //Se a opção de pagamento for Cartão de Crédito
    else if (req.body.payment === "credit-card") {
      let reqs2 = await fetch("https://sandbox.asaas.com/api/v3/payments", {
        method: "POST",
        headers: {
          'accept': 'application/json',
          'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ==',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          "billingType": "CREDIT_CARD",
          "customer": ressNotFirstTime.data[0].id,
          "value": req.body.am,
          "dueDate": req.body.data
        })
      })
      let ress2 = await reqs2.json();
      res.redirect(ress2.invoiceUrl);
    } 
//Se a opção for PIX
else {
  let reqs2 = await fetch("https://sandbox.asaas.com/api/v3/payments", {
    method: "POST",
    headers: {
      'accept': 'application/json',
      'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ==',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      "billingType": "PIX",
      "customer": ressNotFirstTime.data[0].id,
      "value": req.body.am,
      "dueDate": req.body.data
    })
  })
  let ress2 = await reqs2.json();
  res.redirect(ress2.invoiceUrl);
}
} 



  }
);
module.exports = router;
