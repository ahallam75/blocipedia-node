const User = require("./models").User;
const Collaborator = require("./models").Collaborator;
const bcrypt = require("bcryptjs");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  createUser(newUser, callback){
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    return User.create({
      username: newUser.username,
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      const msg = {
        to: 'test@example.com',
        from: 'test@example.com',
        subject: 'Thanks for joining Collabipedia!',
        text: 'You are going to have a blast!',
        html: '<strong>Enjoy your wiki experience!!</strong>',
      };
      sgMail.send(msg);
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    })
  },

  getUser(id, callback) {
    let result = {};
    User.findById(id)
        .then((user) => {
            if (!user) {
                callback(404);
            } else {
                result["user"] = user;
                Collaborator.scope({
                        method: ["userCollaborationsFor", id]
                    }).all()
                    .then((collaborations) => {
                        result["collaborations"] = collaborations;
                        callback(null, result);
                    })
                    .catch((err) => {
                        callback(err);
                    })
            }
        })
  },

  /*
  getUser(id, callback){
    return User.findById(id)
    .then((user) => {
        callback(null, user);
    })
    .catch((err) => {
        callback(err);
    })
  }, */

  changeRole(user){
    User.findOne({
        where: {email: user.email}
    })
    .then((user) => {
        if(user.role === "standard"){
            user.update({
                role: "premium"
            });
        } else if(user.role === "premium"){
            user.update({
                role: "standard"
            });
        }
    })
  }

}