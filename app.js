const express = require("express");
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");
const { error } = require("console");
const color = require("colors");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const fs = require('fs');
const https = require('https');



dotenv.config({ path: "./.env" });

const app = express();

// SSL Certificate
// SSL Certificate
// SSL Certificate
const options = {
    key: fs.readFileSync('C:\\Program Files\\OpenSSL-Win64\\bin\\server.key', 'utf8'),
    cert: fs.readFileSync('C:\\Program Files\\OpenSSL-Win64\\bin\\server.crt', 'utf8'),
    passphrase: 'openssl98068@'
  };



// middleware
app.use(morgan("dev"));

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

db.connect((error) => {
    if (error) {
        console.log("error")
    } else {
        console.log("mysql connected...")
    }
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
console.log(__dirname);

// phrase url-encoded bodies (as sent by html)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// set view engine
app.set('view engine', 'hbs');

// define routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));



app.post("/contacts", async (req, res) => {
    const { name, email, phonenumber, message } = req.body;

    if (!name || !email || !phonenumber || !message) {
        return res.send(`<script>alert("All fields are required!"); window.history.back();</script>`);
    }

    const sql = "INSERT INTO contacts (name, email, phonenumber, message) VALUES (?, ?, ?,?)";
    db.query(sql, [name, email, phonenumber, message], (error, results) => {
        if (error) {
            console.log(error);
            return res.send(`<script>alert("Something went wrong!"); window.history.back();</script>`);
        }
        console.log(results);
        res.send(`<script>alert("Message sent successfully!"); window.location.href='/';</script>`);

    });
});

const port  = process.env.PORT
https.createServer(options,app).listen(port, '192.168.1.68',  () => {
    console.log(`Server is running on localhost:${port}`.bgMagenta.white);
});

