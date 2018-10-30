var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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


app.get('/sales', function(req, res)
{
  console.log("test");
  console.log("test 2");
  res.render('sales.ejs');
});

app.post('/login', function(req, res)
{
  var mysql = require('mysql')
  var username = req.body.username;
  var password = req.body.password;

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
        res.render('manager.ejs');
      }
      if(results[0].access == 1)
      {
        console.log("Logging in " +username+ " as chef")
        res.render('chef.ejs');
      }
      if(results[0].access == 0)
      {
        console.log("Logging in " +username+ " as sales")
        res.render('sales.ejs');
      }


  }catch(e){console.log(e); console.log("Username or Password is incorrect"); res.render('index.ejs', {info: "Invalid Login"}); }
  });
  connection.end();
  });

  app.post('/order', function(req, res)
  {
    var amount1 = Number(req.body.amount1);
    var amount2 = Number(req.body.amount2);
    var amount3 = Number(req.body.amount3);
    var amount4 = Number(req.body.amount4);
    var amount5 = Number(req.body.amount5);
    var price1 = amount1*1.99;
    var price2 = amount2*2.49;
    var price3 = amount3*2.99;
    var price4 = amount4*3.49;
    var price5 = amount5*3.49;
    var totalPrice = price1+price2+price3+price4+price5;
    totalPrice = parseFloat(Math.round(totalPrice * 100) / 100).toFixed(2);

    console.log("Amount: " + amount1)
    console.log("Amount: " + amount2)
    console.log("Amount: " + amount3)
    console.log("Amount: " + amount4)
    console.log("Amount: " + amount5)
    console.log("Total: " + totalPrice)

    res.render('checkout.ejs', {amount1:amount1,amount2:amount2,amount3:amount3,amount4:amount4,amount5:amount5, totalPrice:totalPrice});
  });



  app.post('/order/confirm', function(req, res)
  {
    var amount1 = Number(req.body.amount1);
    console.log(req.body);
    console.log(amount1);
    res.end();
    /*var amount2 = Number(req.body.amount2);
    var amount3 = Number(req.body.amount3);
    var amount4 = Number(req.body.amount4);
    var amount5 = Number(req.body.amount5);
    var price1 = amount1*1.99;
    var price2 = amount2*2.49;
    var price3 = amount3*2.99;
    var price4 = amount4*3.49;
    var price5 = amount5*3.49;
    var totalPrice = price1+price2+price3+price4+price5;
    totalPrice = parseFloat(Math.round(totalPrice * 100) / 100).toFixed(2);

    console.log("Amount: " + amount1)
    console.log("Amount: " + amount2)
    console.log("Amount: " + amount3)
    console.log("Amount: " + amount4)
    console.log("Amount: " + amount5)
    console.log("Total: " + totalPrice)
*/
  /**  var mysql = require('mysql');
    var query = "INSERT INTO `test`.`users` (`seller`, `donut1-count`, `donut2-count`, `donut3-count`, `donut4-count`, `donut5-count`, `totalPrice`) VALUES (sales1'"+amount1+"','"+amount2+"','"+amount3+"','"+amount4+"','"+amount5+"','"+totalPrice+"');"
    var connection = mysql.createConnection
    ({
          host     : 'localhost',
          user     : 'root',
          password : '',
          database : 'project'
    });

    connection.query(sql, function()
    {
      console.log("Inserting data...");
    });

    connection.end();
  **/
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

module.exports = app;
