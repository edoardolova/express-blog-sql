const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root96',
    database: 'blog_db'
});

connection.connect(err => {
    if (err) {
        throw err;
    }

    console.log('connection succesful')
});

module.exports = connection;