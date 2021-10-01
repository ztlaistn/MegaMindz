const {Client } = require('pg')

const client = new Client({
    host = process.env.DB_HOST,
    user = process.env.DB_USER,
    port = process.env.DB_PORT,
    password = process.env.DB_PASSWORD,
    database = process.env.DB_DATABASE
})

client.connect()

client.query("INSERT INTO user_info (Username, Pass, FirstName) VALUES ('test_user', 'test_pass', 'test_name')", (err) =>{
    if(!err){
        console.log("Error inserting")
    }else{
        console.log("Added test user")
    }
})

client.query('SELECT * FROM user_info', (err, res) =>{
    if(!err){
        console.log("Error selecting")
    }else{
        console.log(res)
    }
})

client.end()
