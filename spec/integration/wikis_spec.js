const request = require("request");
const base = "http://localhost:3000/wikis/";

const sequelize = require("../../src/db/models/index").sequelize;
const server = require("../../src/server");
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe("routes : wikis", () => {
  beforeEach((done) => {
    this.wiki;
    this.user;

    sequelize.sync({force: true}).then((res) => {
      User.create({
        username: "Bob Smith",
        email: "bob@example.com",
        password: "1234567890"
      })
      .then((user) => {
        this.user = user;

        Wiki.create({
          title: "Interesting topic",
          body: "With lots of information",
          private: false,
          userId: this.user.id,
        })
        .then((wiki) => {
          this.wiki = wiki;
          done();
        })
      })
    });

   });

   describe("user performing CRUD actions for Wiki", () => {

      beforeEach((done) => {
         User.create({
            username: "Mark Jones",
            email: "mark@example.com",
            password: "1234567890"
         })
         .then((user) => {
            request.get({         
               url: "http://localhost:3000/auth/fake",
               form: {
                 username: user.username,     
                 userId: user.id,
                 email: user.email
               }
             },
               (err, res, body) => {
                 done();
               }
             );
         })
      });

      describe("GET /wikis", () => {
         it("should respond with all wikis", (done) => {
            request.get(base, (err, res, body) => {
               expect(err).toBeNull();
               expect(body).toContain("Interesting topic");
               done();
            });
         });

      });

      describe("GET /wikis/new", () => {
         it("should render a view with a new wiki form", (done) => {
            request.get(`${base}new`, (err, res, body) => {
               expect(err).toBeNull();
               expect(body).toContain("New Wiki");
               done();
            });
         });

      });

      describe("GET /wikis/create", () => {

         it("should create a new wiki and redirect", (done) => {
          const options = {
            url: `${base}create`,
            form: {
              title: "Another interesting topic",
              body: "With even more information",
              userId: this.user.id,
            }
           };

          request.post(options, (err, res, body) => {
            console.log(res.statusMessage);
            Wiki.findOne({where: {title: "Another interesting topic"}})
            .then((wiki) => {
              //expect(wiki).toBeDefined();
              expect(wiki.title).toBe("Another interesting topic");
              expect(wiki.body).toBe("With even more information");
              done();
            })
            .catch((err) => {
              console.log(err);
              done();
            }); 
            }
          );

         });

      });

      describe("GET /wikis/:id", () => {
         
         it("should render a view with the selected wiki", (done) => {
            request.get(`${base}${this.wiki.id}`, (err,res, body) => {
               expect(err).toBeNull();
               expect(body).toContain("Interesting topic");
               done();
            });
         });

      });

      describe("POST /wikis/:id/destroy", () => {

         it("should delete the wiki with the associated ID", (done) => {
            Wiki.all()
            .then((wikis) => {
               const wikiCountBeforeDelete = wikis.length;

               expect(wikiCountBeforeDelete).toBe(1);

               request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
                  Wiki.all()
                  .then((wikis) => {
                     expect(err).toBeNull();
                     expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
                     done();
                  })
               });
            })
         });

      });

      describe("GET /wikis/:id/edit", () => {
         
         it("should render a view with an edit wiki form", (done) => {
            request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
              expect(err).toBeNull();
              expect(body).toContain("Edit Wiki");
              expect(body).toContain("Interesting topic");
              done();
            })
         });

      });

      describe("POST /wikis/:id/update", () => {

         it("should update the wiki with the given values", (done) => {
            request.post({
               url: `${base}${this.wiki.id}/update`,
               form: {
                  title: "Really interesting topic",
                  body: "Tons of interesting information",
                  userId: this.user.id
               }
            }, (err, res, body) => {
               expect(err).toBeNull();
               Wiki.findOne({
                  where: {id:1}
               })
               .then((wiki) => {
                  expect(wiki.title).toBe("Really interesting topic");
                  done();
               });
            });
         });

         it("should allow other users to update the wiki with the given values", (done) => {
          User.create({
            username: "Sam Green",
            email: "sam@example.com",
            password: "goodpassword"
          })
          .then((user) => {
            request.post({
              url: `${base}${this.wiki.id}/update`,
              form: {
                title: "Politics in America",
                body: "There are three branches of government",
                userId: user.id
              }
            }, (err, res, body) => {
              expect(err).toBeNull();
              expect(user.id).toBe(3);
              Wiki.findOne({
                where: {id:1}
              })
              .then((wiki) => {
                expect(wiki.userId).toBe(3);
                expect(wiki.title).toBe("Politics in America");
                done();
              });
            });
          })
        });

      });

   });

});

      