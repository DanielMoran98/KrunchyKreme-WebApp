var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'kkwurhglkhwrglkwregb',
  resave: false,
  saveUninitialized: true,
  
}))
app.use(function(req, res, next) { //Add Session vars to be used in ejs files
  res.locals.username = req.session.username;
  res.locals.access = req.session.access;
  res.locals.amount1 = req.session.amount1;
  res.locals.amount2 = req.session.amount2;
  res.locals.amount3 = req.session.amount3;
  res.locals.amount4 = req.session.amount4;
  res.locals.amount5 = req.session.amount5;
  res.locals.totalPrice = req.session.totalPrice;
  next();
});



app.all('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
})

app.get('/login', function(req, res){
  if(req.session.access == 2)
  {
    res.redirect('/manager')
  }else if(req.session.access == 1)
  {
    res.render('chef.ejs');
  }else if(req.session.access == 0)
  {
    res.render('sales.ejs')
  }else{
    res.redirect('/');
  }
});


app.post('/login', function(req, res)
{
  var mysql = require('mysql')
  var username = req.body.username;
  var password = req.body.password;
  req.session.username = username;
  var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : '',
        database : 'project'
      });

  var sql = "SELECT * FROM users WHERE username = '" + username +"' AND password = '" + password + "'";

  connection.connect();

  var query = connection.query(sql, function (error, results, fields){
    if (error) next(error);

    try{
      console.log("Results " + results[0].access);

      if(results[0].access == 2)
      {
        console.log("Logging in " +username+ " as manager")
        req.session.access = 2;
        res.render('manager.ejs');
      }
      if(results[0].access == 1)
      {
        console.log("Logging in " +username+ " as chef")
        req.session.access = 1;
        res.render('chef.ejs');
      }
      if(results[0].access == 0)
      {
        console.log("Logging in " +username+ " as sales")
        req.session.access = 0;
        res.render('sales.ejs');
      }


  }catch(e){console.log(e); console.log("Username or Password is incorrect"); res.render('index.ejs', {info: "Invalid Login"}); }
  });
  connection.end();
  });

  app.get('/sales', function(req, res)
  {
    console.log("test");
    console.log(req.session.access);
    if(req.session.access == 0)
    {
      res.render('sales.ejs');
    }else{
      res.redirect('/');
    }

  });

app.get('/manager', function(req, res)
{
    res.render('manager.ejs');
})

app.get('/order', function(req, res)
  {
    if(req.session.access == 0){
      res.render('checkout.ejs')
    }else
    {
      res.render('index.ejs',{info: 'Incorrect permissions to view that page.'})
    }
  })



app.post('/order', function(req, res)
  {
    console.log(req.session);
    console.log("ACCESS LEVEL ===== " + req.session.access)
    req.session.amount1 = req.body.amount1;
    req.session.amount2 = req.body.amount2;
    req.session.amount3 = req.body.amount3;
    req.session.amount4 = req.body.amount4;
    req.session.amount5 = req.body.amount5;

    console.log(req.session.amount1 + " is the session variable");
    var amount1 = Number(req.body.amount1);
    var amount2 = Number(req.body.amount2);
    var amount3 = Number(req.body.amount3);
    var amount4 = Number(req.body.amount4);
    var amount5 = Number(req.body.amount5);
    var price1 = req.session.amount1*1.99;
    var price2 = req.session.amount2*2.49;
    var price3 = req.session.amount3*2.99;
    var price4 = req.session.amount4*3.49;
    var price5 = req.session.amount5*3.49;
    var totalPrice = price1+price2+price3+price4+price5;
    totalPrice = parseFloat(Math.round(totalPrice * 100) / 100).toFixed(2);

    req.session.totalPrice = totalPrice;
    console.log("Amount: " + req.session.amount1)
    console.log("Amount: " + req.session.amount2)
    console.log("Amount: " + req.session.amount3)
    console.log("Amount: " + req.session.amount4)
    console.log("Amount: " + req.session.amount5)
    console.log("Total: " + req.session.totalPrice)

    res.render('checkout.ejs', {amount1:amount1,amount2:amount2,amount3:amount3,amount4:amount4,amount5:amount5, totalPrice:totalPrice});
  });



app.post('/order/confirm', function(req, res)
  {

    var username = req.session.username;
    var amount1 = Number(req.body.amount1);
    var amount2 = Number(req.session.amount2)
    var amount3 = Number(req.session.amount3)
    var amount4 = Number(req.session.amount4)
    var amount5 = Number(req.session.amount5)
    var totalPrice = Number(req.session.totalPrice)

    console.log("Confirming total price as: " +totalPrice);

    try{
        var mysql = require('mysql');

        var connection = mysql.createConnection
        ({
              host     : 'localhost',
              user     : 'root',
              password : '',
              database : 'project'
        });

        var sql = "INSERT INTO `project`.`orders` (`seller`, `donut1-count`, `donut2-count`, `donut3-count`, `donut4-count`, `donut5-count`, `totalPrice`) VALUES ('"+username+"','"+amount1+"','"+amount2+"','"+amount3+"','"+amount4+"','"+amount5+"','"+totalPrice+"');"
        var query = connection.query(sql, function(err, result)
        {
          if(err) throw err
          console.log("Inserting data...");

        });
        res.render("confirmation.ejs");
        connection.end();
    }catch(e){
        console.log(e);
    }

  });

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, function()
{
  console.log("listening on port 3000!")
})
module.exports = app;
