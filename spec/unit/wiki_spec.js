const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;



describe("Wiki", () => {

   beforeEach((done) => {
      this.wiki;
      this.user;
  
      sequelize.sync({force: true}).then((res) => {
        User.create({
          username: "starman",
          email: "starman@tesla.com",
          password: "Trekkie4lyfe"
        })
        .then((user) => {
          this.user = user; //store the user
          Wiki.create({
            title: "Expeditions to Alpha Centauri",
            body: "A compilation of reports from recent visits to the star system.",
            private: false,
            userId: this.user.id
          })
          .then((wiki) => {
            this.wiki = wiki; //store the wiki
            done();
          })
          .catch((err) => {
            console.log(err);
          });
        })
      });

   });

   describe("#create()", () => {

      it("should create a wiki with a title, body, and private status", (done) => {
         Wiki.create({
            title: "Inventors",
            body: "Inventor extroardinaire",
            private: false,
            userId: this.user.id
         })
         .then((wiki) => {
            expect(wiki.title).toBe("Inventors");
            expect(wiki.body).toBe("Inventor extroardinaire");
            done();
         })
         .catch((err) => {
            console.log(err);
            done();
         });
      });

  

   });

   describe("#setUser()", () => {
    
    it("should associate a wiki and a user together", (done) => {
      User.create({
        username: "Sally James",
        email: "sally@example.com",
        password: "1234567890"
      })
      .then((newUser) => {
        expect(this.wiki.userId).toBe(this.user.id);
        this.wiki.setUser(newUser)
        .then((wiki) => {
          expect(this.wiki.userId).toBe(newUser.id);
          done();
        })
      })
    });

   });

   describe("#getUser()", () => {

    it("should return the associated wiki", (done) => {
      this.wiki.getUser()
      .then((associatedUser) => {
        expect(associatedUser.email).toBe("starman@tesla.com");
        done();
      })
    });

   });

});