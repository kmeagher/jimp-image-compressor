const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const compress = require('./controllers/compress');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/compress", (req, res) => {
  fs.readdir(path.join(__dirname, "queue"), async (err, files) => {
    if (err || files==null) {
      res.status(400).send(err);
    } else {
      files.forEach(async (file) => {
        console.log("===> File <===");
        console.log(file);
        await compress.doCompressImage(file);
      });
    }
    res.status(200).send({"StatusCode": "Complete", "Count": files.length});
  });
});

app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/compress.html"));
});

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
