require("dotenv").config();
const bodyParser = require("body-parser");
const logger = require('morgan');

module.exports = {
  init(){
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(logger('dev'));

  }
};