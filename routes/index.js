var express = require('express');
var pasth = require('path');
var bcrypt = require('bcrypt');
var router = express.Router();
var db = require("../src/models/dao/eventosDAO");
var collection = require("../src/models/dao/usersDAO");

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
      res.send("Usuário existente.");
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
      res.send("user name cannot found");
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if(isPasswordMatch){
      var eventos = await db.getEventos();
      console.log(eventos);
      res.render("evento", { title: "Express", evento: eventos });

    }else{
      res.send("wrong password");
    }
  }catch{
    res.send("details");
  }

});

module.exports = router;
