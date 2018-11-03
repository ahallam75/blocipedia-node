const sequelize = require("../../src/db/models/index").sequelize;
const User = require("../../src/db/models").User;

describe("User", () => {

   beforeEach((done) => {
      sequelize.sync({force: true}) // Clears the DB before test
      .then(() => {
         done();
      })
      .catch((err) => {
         console.log(err);
         done();
      });
   });

   describe("#create()", () => {

      it("should create a User object with a valid email and password", (done) => {
         User.create({
            name: "Jean Grey",
            email: "jean@hotmail.com",
            password: "phoenixRising"
         })
         .then((user) => {
            expect(user.email).toBe("jean@hotmail.com");
            expect(user.id).toBe(1);
            done();
         })
         .catch((err) => {
            console.log(err);
            done();
         });
      });

      it("should not create a user with an invalid email or password", (done) => {
         User.create({
            name: "Scott",
            email: "Scott Summers",
            password: "123456789"
         })
         .then((user) => {
            done();
         })
         .catch((err) => {
            expect(err.message).toContain("Validation error: must be a valid email");
            done();
         });
      });

      it("should not create a user with an email already taken", (done) => {
         User.create({
            name: "Jean Grey",
            email: "jean@hotmail.com",
            password: "phoenixRising"
         })
         .then((user) => {
            User.create({
               name: "Jean Grey",
               email: "jean@hotmail.com",
               password: "smoldering!!!"
            })
            .then((user) => {
               done();
            })
            .catch((err) => {
               done();
            })
         })
         .catch((err) => {
            console.log(err);
            done();
         });
      });

   });

});