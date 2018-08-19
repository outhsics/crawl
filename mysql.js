let mysql = require('mysql');
let Promise = require('bluebird');
let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'juejin',
    user: 'root',
    password: 'root'
});
connection.connect();
let query = Promise.promisify(connection.query).bind(connection);


// (async function () {
//     let result = await query(`INSERT INTO users(email) VALUES(?)`, ['8361@qq.com']);
//     console.log(result);
// })()
module.exports = {
    query
}
// connection.query('SELECT * from student', function (err, rows, fields) {
//     console.log(err);
//     console.log(rows);
//     console.log(fields);
//     connection.end();
// });
