const { Pool, Client } = require('pg');

console.log(typeof process.env.DB_PORT);

const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: Number(process.env.DB_PORT),
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    sslmode: true,
	ssl: {rejectUnauthorized: false}
});

// const client = new Client({
//     connectionString: process.env.DATABASE_URL,
// });

console.log(client.host);

client.connect(err => {
    if(err){
        console.log("connection error", err);
        client.end(()=>console.log("exited"));
    }else{
        console.log('Connected');
        const insert_query = {
            text: 'INSERT INTO user_info (username, hash) VALUES ($1, $2)',
            values: ['test_user', 'test_hash'],
        }
        
        client.query(insert_query, (err) =>{
            if(err){
                console.log("insert error: ", err);
                client.end(()=>console.log("exited"));
            }else{
                console.log("Added test user");

                client.query('SELECT * FROM user_info', (err, res) =>{
                    if(err){
                        console.log("select error: ", err);
                        client.end(()=>console.log("Failed and exited"));
                    }else{
                        console.log(res.rows);
                        client.end(()=>console.log("Passed test and exited"))
                    }
                });
            }
        })
        
    }
})

