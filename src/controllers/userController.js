const userQueries = require("../db/queries.users");
const wikiQueries = require("../db/queries.wikis.js");
const passport = require("passport");
const sgMail = require('@sendgrid/mail');
const stripe = require("stripe")("pk_test_6PyQxh7UzKFq84my5MfvGUQP");

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
  },
  show(req, res, next) {
    userQueries.getUser(req.params.id, (err, user) => {
        if(err || user === undefined){
            req.flash("notice", "No user found with that ID.");
            res.redirect("/");
        } else {
            res.render("users/show", {user});
        }
    });
  },

  showUpgradePage(req, res, next){
    userQueries.getUser(req.params.id, (err, user) => {
        if(err || user === undefined){
            req.flash("notice", "User does not match any ID");
            res.render("/");
        } else {
            res.render("users/upgrade", {user});
        }
    });
  },

  upgrade(req, res, next){
    const token = req.body.stripeToken;
    const email = req.body.stripeEmail;
    User.findOne({
        where: {email: email}
    })
    .then((user) => {
        if(user){
            const charge = stripe.charges.create({
                amount: 1500,
                currency: 'usd',
                description: 'Premium Upgrade',
                source: token,
            })
            .then((result) => {
                if(result){
                    userQueries.toggleRole(user);
                    req.flash("notice", "Your upgrade to premium was successful");
                    res.redirect("/wikis");
                } else {
                    req.flash("notice", "Failed to upgrade");
                    res.redirect("users/show", {user});
                }
            })
        } else {
            req.flash("notice", "Failed to upgrade");
            res.redirect("users/upgrade");
        }
    })
  },

  showDowngradePage(req, res, next){
    userQueries.getUser(req.params.id, (err, user) => {
        if(err || user === undefined){
            req.flash("notice", "User does not match any ID");
            res.redirect("/");
        } else {
            res.render("users/downgrade", {user});
        }
    });
  },

  downgrade(req, res, next){
    User.findOne({
        where: {id: req.params.id}
    })
    .then((user) => {
        if(user){
            userQueries.toggleRole(user);
            req.flash("notice", "Your downgrade to standard was successful!");
            res.redirect("/wikis");
        } else {
            req.flash("notice", "Failed to downgrade");
            res.redirect("users/show", {user});
        }
    })
  }
}
