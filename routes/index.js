var express = require('express');
var pasth = require('path');
var bcrypt = require('bcrypt');
var router = express.Router();
var db = require("../src/models/dao/eventosDAO");
var collection = require("../src/models/dao/usersDAO");
const fetch = require('node-fetch');
const cors = require('cors');
let message="";
let type= "";
/*codigo api asaas $aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ== */


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get("/descricao/:id", async  (req, res, next) => {
  const id= req.params.id;
  try {
    const doc = await db.findOne(id);
    res.render('descricao', { title: 'Descricao', evento:doc });
  } catch (err) {
    next(err);
  }
});

router.get("/evento/mes/:nome", async  (req, res, next) => { 
  const nome= req.params.nome;
  try {
    const doc = await db.findMes(nome);
    res.render('evento', { title: 'Evento', evento:doc });
  } catch (err) {
    next(err);
  }
});

router.get("/evento/local/:nome", async  (req, res, next) => { 
  const nome= req.params.nome;
  try {
    const doc = await db.findLocal(nome);
    res.render('evento', { title: 'Evento', evento:doc });
  } catch (err) {
    next(err);
  }
});

router.get("/evento/acao/:nome", async  (req, res, next) => { 
  const nome= req.params.nome;
  try {
    const doc = await db.findAcao(nome);
    res.render('evento', { title: 'Evento', evento:doc });
  } catch (err) {
    next(err);
  }
});


router.post("/cadastro", async  (req, res) => {
  const data = {
    name:req.body.username,
    email:req.body.email,
    password:req.body.password
  }

  const existingUser = await collection.findOne({email: data.email});
    if(existingUser){
      setTimeout(() => {message = ""},1000);
      console.log(message);
      message ="Este email já está sendo utilizado!"
      type="danger";
      res.render("cadastro", { title: "Express", message:message, type:type }) ;
      setTimeout(() => {message = ""},2000);
    }else{
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password,saltRounds);

      data.password= hashedPassword;
      const userdata = await collection.insertMany(data);
      var eventos = await db.getEventos();
      console.log(eventos);
      res.render("evento", { title: "Express", evento: eventos }) ;
    }
});

router.post("/login", async  (req, res) => {
  try{
    const check = await collection.findOne({email: req.body.email});
    if(!check){
      message = "Seu e-mail está incorreto!";
      type = "danger";
      res.render("login", { title: "Express", message:message, type:type }) ;
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if(isPasswordMatch){
      var eventos = await db.getEventos();
      console.log(eventos);
      res.render("evento", { title: "Express", evento: eventos });

    }else{
      message = "Sua senha está incorreta!";
      type = "danger";
      res.render("login", { title: "Express", message:message, type:type }) ;
    }
  }catch{
 
  }

});

router.post("/pagamento", async  (req, res) => {
  console.log(req.body.fullname);
  console.log(req.body.cpf);
  console.log(req.body.payment);
  console.log(req.body.am);
  console.log(req.body.data);

  let reqs = await fetch("https://sandbox.api.pagseguro.com/orders",{
    method: 'POST',
    headers:{
      'Authorization': 'Bearer 1CD687093DCA4658A56731F45081F67A',
      'accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      {
        "reference_id": "ex-00001",
        "customer": {
          "name": req.body.fullname,
          "email": "pauladantas_4@hotmail.com",
          "tax_id": '89270282368',
          "phones": [
            {
              "country": "55",
              "area": "85",
              "number": "991375875",
              "type": "MOBILE"
            }
          ]
        },
        "items": [
          {
            "reference_id": "Doação",
            "name": "Exposição de arte beneficente",
            "quantity": 1,
            "unit_amount": 500
          }
        ],
        "shipping": {
          "address": {
            "street": "Travessa Joaquim Ramos",
            "number": "129",
            "complement": "Rua fechada",
            "locality": "Barrocão",
            "city": "Itaitinga",
            "region_code": "CE",
            "country": "BRA",
            "postal_code": "61887587"
          }
        },
        "notification_urls": [
          "https://meusite.com/notificacoes"
        ],
        "charges": [
          {
            "reference_id": "referencia da cobranca",
            "description": "descricao da cobranca",
            "amount": {
              "value": req.body.am,
              "currency": "BRL"
            },
            "payment_method": {
              "type": req.body.payment,
              "boleto": {
                "due_date": req.body.data,
                "instruction_lines": {
                  "line_1": "Pagamento processado para DESC Fatura",
                  "line_2": "Via PagSeguro"
                },
                "holder": {
                  "name": req.body.fullname,
                  "tax_id": "89270282368",
                  "email": "jose@email.com",
                  "address": {
                    "country": "Brasil",
                    "region": "São Paulo",
                    "region_code": "SP",
                    "city": "Sao Paulo",
                    "postal_code": "01452002",
                    "street": "Avenida Brigadeiro Faria Lima",
                    "number": "1384",
                    "locality": "Pinheiros"
                  }
                }
              }
            }
          }
        ]
      }
    )


  });  
  let ress = await reqs.json();
  console.log(ress);
  res.redirect(ress.charges[0].links[1].href);
}



//criando cliente
 /*  const url = 'https://sandbox.asaas.com/api/v3/customers';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ=='
    },

    body: JSON.stringify({name: req.body.fullname, cpfCnpj: req.body.cpf})
  };
  
  fetch(url, options)
    .then(res => res.json())
    .then(json => {
      console.log(json);
      return json;
  })
    .catch(err => console.error('error:' + err));

  //criando cobrança
  const pagamento = 'https://sandbox.asaas.com/api/v3/payments';
  const data = {
  method: 'POST',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwODE0NzU6OiRhYWNoX2YxYWVmMzc3LTZlZDgtNGY1Mi1iMDc5LWNkMjVhMzE5NWE1OQ=='
  },
  body: JSON.stringify({
    billingType: req.body.payment,
    customer: json.id,
    value: req.body.am,
    dueDate: req.body.data
  })
};

fetch(pagamento, data)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:' + err));*/
); 


module.exports = router;
