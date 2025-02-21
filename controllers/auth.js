const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register = (req, res) => {
    console.log(req.body);

    const { name, email, password, passwordConfirm } = req.body;
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('register', { 
                message: 'Email already exists !'
            })
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Passwords do not match !'
            });
        }

        let hasedPassword = await bcrypt.hash(password, 8);
        console.log(hasedPassword);

        db.query('INSERT INTO users  SET ?', { name: name, email: email, password: hasedPassword }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('register', {
                    message: 'User Registered sucessfully '
                });
            }
        })
    });
}

// Login Function
// Login Function
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', {
        message: 'please enter email and password ! '
    });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
        return res.status(400).render('login', {
            message: 'please enter email and password ! '
        });
    }

    const user = results[0];
    const hashedPassword = user.password;

    console.log('Stored Password Hash:', hashedPassword);
    console.log('Entered Password:', password);

    const isValidPassword = await bcrypt.compare(password, hashedPassword);
    console.log('Is valid password:', isValidPassword);

    // Additional logging to check the salt and rounds used in the hashed password
    const saltRounds = await bcrypt.getSalt(hashedPassword);
    console.log('Salt Rounds:', saltRounds);

    if (!isValidPassword) {
        return res.status(400).render('login', {
            message: ' email and password is incorrect ! '
        }); 
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true });
    return res.status(200).redirect('/');
  });
};