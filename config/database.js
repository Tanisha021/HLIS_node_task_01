const sql = require('mysql2');
let credentials = {}

// condition to check where enviroment is production or development
credentials = {
    host: "127.0.0.1",
    user: "root",  
    password: "12345678",  
    database: "DB_17",  
    dateStrings: "date"
};

const database = sql.createPool(credentials).promise();
// Test database connection
// database.getConnection((err, connection) => {
//     if (err) {
//         console.error("❌ Database Connection Failed: ", err);
//         return;
//     }
//     console.log("✅ Database Connected Successfully!");
//     connection.release(); // Release connection back to pool
// });

module.exports = database;