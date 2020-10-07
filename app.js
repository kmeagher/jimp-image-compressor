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

let compressionResults = [];
let allFilesCompleted = false;

app.use("/processing", (req, res) => {
  res.sendFile(path.join(__dirname, "views/processing.html"));
});

app.use("/compressionStatus", (req, res) => {
  res.status(200).send(compressionResults);
});

// TODO: in processing.html, read this to stop calling a check on /compressionStatus once all files have completed - update UI
app.use("/processingStatus", (req, res) => {
  res.status(200).send(allFilesCompleted);
});

app.use("/compress", (req, res) => {
  compressionResults = [];
  allFilesCompleted = false;
  //res.status(200).send("Process Started");
  res.sendFile(path.join(__dirname, "views/processing.html"));
  fs.readdir(path.join(__dirname, "queue"), async (err, files) => {
    if (err || files==null) {
      res.status(400).send(err);
    } else {
      compressionResults.push(`Found ${files.length} files in the queue`);
      for(let i = 0; i < files.length; i++) {
        let file = files[i];
        console.log("===> File <===");
        console.log(file);
        compressionResults.push(`Processing File: ${file}`);
        await compress.doCompressImage(file);
        compressionResults.push(`File, ${file}, is compressed`);
      }
      compressionResults.push("File are compressed");
      allFilesCompleted = true;
    }
    //res.status(200).send({"StatusCode": "Complete", "Count": files.length});
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
