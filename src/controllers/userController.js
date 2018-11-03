module.exports = {
  signUp(req, res, next){
    res.render("users/sign_up");
  }
}

const userQueries = require("../db/queries.users");
const passport = require("passport");
const sgMail = require('@sendgrid/mail');

module.exports = {
  signUp(req, res, next){
     res.render("users/signup");
  },
  create(req, res, next){
    let newUser = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    userQueries.createUser(newUser, (err, user) => {
      if(err){
        req.flash("error", err);
        res.redirect("/users/signup");
      }
      else{
        passport.authenticate("local")(req, res, () => {
          req.flash("notice", "You've successfully signed in!");
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const msg = {
            to: user.email,
            from: 'support@blocipedia.com',
            subject: 'Welcome to Blocipedia!',
            text: `Welcome to Blocipedia ${user.username}!`,
            html: `<strong>Welcome to Blocipedia ${user.username}!</strong>`,
          };
          sgMail.send(msg);
          res.redirect("/");
        })
      }
    });
  }
}