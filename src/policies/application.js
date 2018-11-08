module.exports = class ApplicationPolicy {
    constructor(user, record) {
       this.user = user;
       this.record = record;
    }
 
    _isOwner() {
       return this.record && (this.record.userId == this.user.id);
    }
 
    _isAdmin() {
       return this.user && this.user.role == 2;
    }
 
    new() {
       return this.user != null;
    }
 
    show() {
       return true;
    }
  
    edit() {
       return this.user != null;
    }
   
    update() {
       return this.edit();
    }
  
    destroy() {
    return this.update();
    }
 }