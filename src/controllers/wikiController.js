const wikiQueries = require("../db/queries.wikis.js");
const Authorizer = require("../policies/wiki");
const flash = require("express-flash");
const markdown = require( "markdown" ).markdown;
const Wiki = require("../db/models").Wiki;
const Collaborator = require("../db/models").Collaborator;
const User = require("../db/models").User;
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

module.exports = {

   index(req, res, next) {
    Wiki.findAll({
        include: [{
          model: Collaborator,
          as: "collaborators",
          attributes: ["userId"]
        }],
        where: {
          [Op.or]: [{private: false}, {userId: req.user.id}, {'$collaborators.userId$': req.user.id}]
        }
    })
        .then((wikis) => {
          res.render("wikis/index", {wikis});
        })

        .catch(err => {
            console.log(err);
            res.redirect(500, "static/index");
        }) 
   },

   

   new(req, res, next) { 
    const authorized = new Authorizer(req.user).new();
    if(authorized){
        res.render("wikis/new");
    } else {
        req.flash("notice", "You are not authorized to do that.");
        res.redirect("wikis");
    }
   },

   create(req, res, next) {
    const authorized = new Authorizer(req.user).create();
    if(authorized){
        let newWiki = {
            title: req.body.title,
            body: req.body.body,
            private: req.body.private,
            userId: parseInt(req.user.id)
        };
        
        wikiQueries.addWiki(newWiki, (err, wiki) => {
            if (err) {
                res.redirect(500, "/wikis/new");
            } else {
                res.redirect(303, `/wikis/${wiki.id}`);
            }
        });
    } else {
        req.flash("notice", "You are not authorized to do that.");
        res.redirect("/wikis")
    }    
   },
/*
   show(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        res.redirect(404, "/");
      } else {
        wiki.body = markdown.toHTML(wiki.body);
        res.render("wikis/show", { wiki });
      }
    });
   },*/
   
   show(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
        wiki = wiki["wiki"]; 
        collaborators = wiki["collaborators"];

        if (err || wiki == null) {
            res.redirect(404, "/");
        } else {
            wiki.body = markdown.toHTML(wiki.body);
            res.render("wikis/show", {
                wiki
            });
        }
    });
   },

   destroy(req, res, next){
        wikiQueries.deleteWiki(req, (err, wiki) => {
          if(err){
            res.redirect(err, `/wikis/${req.params.id}`)
          } else {
            res.redirect(303, "/wikis")
          }
        });
   },
/*
   edit(req, res, next){ 
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
        if(err || wiki == null){
            res.redirect(404, "/");
        } else {
            const authorized = new Authorizer(req.user, wiki).edit();
            if(authorized){
                res.render("wikis/edit", {wiki});
            } else {
                req.flash("notice", "You are not authorized to do that.");
                res.redirect(`/wikis/${req.params.id}`);
            }
        }
    });
   }, */



   edit(req, res, next) {
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
        wiki = wiki["wiki"]; 
        collaborators = wiki["collaborators"];

        if (err || wiki == null) {
            res.redirect(404, "/");
        } else {
            const authorized = new Authorizer(req.user, wiki, collaborators).edit();
            if (authorized) {
                res.render("wikis/edit", {
                    wiki,
                    collaborators
                });
            } else {
                req.flash("You are not authorized to do that.");
                res.redirect(`/wikis/${req.pararms.id}`)
            }
        }
    });
   }, 
    
   update(req, res, next) {
      wikiQueries.updateWiki(req, req.body, (err, wiki) => {
         if(err || wiki == null) {
            res.redirect(404, `/wikis/${req.params.id}/edit`);
         }
         else {
            res.redirect(`/wikis/${wiki.id}`);
         }
      });
   },

   private(req, res, next) {
    wikiQueries.getAllWikis((err, wikis) => {
        if (err) {
          console.log(err);
            res.redirect(500, "static/index");
        } else {
            res.render("/wikis/private", {wikis});
        }
    })
   }

}

