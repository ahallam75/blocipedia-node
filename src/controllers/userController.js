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
  }, 
  signInForm(req, res, next){
    res.render("users/signin");
  },
  signIn(req, res, next){
    passport.authenticate("local")(req, res, function() {
      if(!req.user){
        req.flash("notice", "Sign in failed. Please try again.");
        res.redirect("/users/signin");
      }
      else{
        req.flash("notice", "You've successfully signed in!");
        res.redirect("/");
      }
    })
  },
  signOut(req, res, next){
    req.logout();
    req.flash("notice", "You've successfully signed out");
    res.redirect("/");
  }
}