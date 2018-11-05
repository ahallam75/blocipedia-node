const Wiki = require("./models").Wiki;

module.exports = {
   getAllWikis(callback) {
      return Wiki.all()

      .then((wikis) => {
         callback(null, wikis);
      })
      .catch((err) => {
         callback(err);
      });
   },
   addWiki(newWiki, callback) {
      return Wiki.create(newWiki)
      .then((wiki) => {
         callback(null, wiki);
      })
      .catch((err) => {
         callback(err);
      });
   },
   getWiki(id, callback) {
      return Wiki.findById(id)
      .then((wiki) => {
         callback(null, wiki);
      })
      .catch((err) => {
         callback(err);
      });
   },
   deleteWiki(id, callback) {
      return Wiki.destroy({
         where: {id}
      })
      .then((wiki) => {
         callback(null, wiki);
      })
      .catch((err) => {
         callback(err);
      });
   },
   updateWiki(req, updatedWiki, callback) {
      return Wiki.findById(req.params.id)
      .then((wiki) => {
         if(!wiki){
            return callback("Wiki not found");
         }
         wiki.update(updatedWiki, {
            fields: Object.keys(updatedWiki)
         })
         .then(() => {
            callback(null, wiki);
         })
         .catch((err) => {
            callback(err);
         });
      })
   }
}