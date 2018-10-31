require("dotenv").config();
const bodyParser = require("body-parser");

module.exports = {
  init(){
    app.use(bodyParser.urlencoded({ extended: true }));

  }
};