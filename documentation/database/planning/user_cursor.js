const {Pool, Client} = require('pg');
const cred = require('./database_cred');

class user_cursor_obj{
    constructor(ID=0){
        this.cursor_ID = ID
        this.pool = new Pool(cred)        
    }
    get_cursor_ID(){
        return {ID: this.cursor_ID}
    }

}