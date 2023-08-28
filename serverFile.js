let express = require("express");
let app = express();
const cors = require("cors");
app.use(express.json());
// app.use(cors)
app.options("*", cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow_Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept "
  );
  next();
});

const port = 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

const { Client } = require("pg");
const connData = new Client({
  user: "postgres",
  password: "S9301122206y$",
  database: "postgres",
  port: 5432,
  host: "db.drtgkmmltkpuytlmmezw.supabase.co",
  ssl: { rejectUnauthorized: false },
});
connData.connect(function (res, error) {
  console.log(`Connected!!!`);
});


  app.get("/products", function (req, res, next) {
    console.log("Inside /products get api");
    const query = "SELECT * from products";
    let sort = req.query.sort;
    let available = req.query.available;
    let category = req.query.category;
    let price = req.query.price;
    
    connData.query(query, function (err, result) {
      if (err) res.status(404).send(err);
      else {
        result.rows = filterParam3(result.rows, "price", price);
        result.rows = filterParam2(result.rows, "available", available);
        result.rows = filterParam(result.rows, "category", category);
        if(sort==="By Price(Low to High)") result.rows.sort((st1,st2) => st1.price-st2.price);
        if(sort==="By Price(Low to High)") result.rows.sort((st1,st2) => st2.price-st1.price);
        if(sort==="By Name(A to Z)") result.rows.sort((st1,st2) => st1.name.localeCompare(st2.name));
        if(sort==="By Name(Z to A)") result.rows.sort((st1,st2) => st2.name.localeCompare(st1.name));
        res.send(result.rows)
      };
    });
  });

  app.post("/products", function (req, res, next) {
    console.log("Inside post of products");
    var values = Object.values(req.body);
    console.log(values);
    let sql = `insert into products(name,category,price,available) values($1,$2,$3,$4)`;
    connData.query(sql, values, function (err, result) {
      if (err) res.status(404).send(err);
      else res.send(`${result.rowCount} insection successful`);
    });
  });

  app.put("/products/:id", function (req, res, next) {
    console.log("Inside put of products");
    let id = +req.params.id;
    let name = req.body.name;
    let category = req.body.category;
    let price = req.body.price;
    let available = req.body.available;
    let values = [category,price,available,id];
    let sql = `update products set category=$1,price=$2,available=$3 where id=$4`;
    connData.query(sql, values, function (err, result) {
      if (err) res.status(404).send(err);
      else res.send(`${result.rowCount} updation successful`);
    });
  });

  app.get("/products/:id", function (req, res, next) {
    console.log("Inside /products/:id get api");
    let id = +req.params.id;
    let values = [id];
    let sql = `SELECT * from products where id=$1`;
    connData.query(sql, values, function (err, result) {
      if (err) res.status(404).send(err);
      else res.send(result.rows);
    });
  });

  let filterParam = (arr, nam, values) => {
    if (!values) return arr;
    console.log(arr, nam, values)
    let valuesArr = values.split(",");
    console.log(valuesArr);
    let arr1 = arr.filter((a1) => valuesArr.find((val) => val === a1[nam]));
    console.log(arr1);
    return arr1;
  };

  let filterParam2 = (arr, nam, values) => {
    if (!values) return arr;
    let val = values=="Available" ? true:false;
    let arr1 = arr.filter((a1) => a1[nam] === val);
    return arr1;
  };

  let filterParam3 = (arr, name, values) => {
    if (!values) return arr;
    let arr1 = arr.filter((a1) => +(values) >= a1[name]);
    return arr1;
  };

  app.delete("/products/:id", function (req, res, next) {
    console.log("Inside delete of products");
    let id = +req.params.id;
    let values = [id];
    let sql = `delete from products where id=$1`;
    console.log(id);
    connData.query(sql, values, function (err, result) {
      console.log(sql, result);
      if (err) res.status(404).send(err);
      else res.send(`${result.rowCount} delete successful`);
    });
  });