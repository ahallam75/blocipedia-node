const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/users/";
const User = require("../../src/db/models").User;
const sequelize = require("../../src/db/models/index").sequelize;

describe("routes : users", () => {

   beforeEach((done) => {
      sequelize.sync({force: true})
      .then(() => {
         done();
      })
      .catch((err) => {
         console.log(err);
         done();
      });
   });

   describe("GET /users/signup", () => {
      
      it("should render a view with a sign up form", (done) => {
         request.get(`${base}signup`, (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("Sign Up");
            done();
         });
      });

   });

   describe("POST /users/signup", () => {

      it("should create a new user with valid values and redirect", (done) => {
         const options = {
            url: base + "signup",
            form: {
               name: "Ororo Munroe",
               email: "ororo@example.com",
               password: "12345678"
            }
         }

         request.post(options, (err, res, body) => {
            User.findOne({where: {email: "ororo@example.com"}})
            .then((user) => {
               expect(user).not.toBeNull();
               expect(user.email).toBe("ororo@example.com");
               expect(user.id).toBe(1);
               done();
            })
            .catch((err) => {
               console.log(err);
               done();
            });
         })

      });

      it("should not create a new user with invalid attributes and redirect", (done) => {
         request.post(
            {
               url: base + "signup",
               form: {
                  name: "noname",
                  email:"none",
                  password:"123456789"
               }

            },
            (err, res, body) => {
               User.findOne({where: {email: "none"}})
               .then((user) => {
                  expect(user).toBeNull();
                  done();
               })
               .catch((err) => {
                  console.log(err);
                  done();
               });
         })
      });

   });

});