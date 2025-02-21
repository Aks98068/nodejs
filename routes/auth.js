const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

// Token verification middleware
const jwt = require("jsonwebtoken");
exports.isAuthenticated = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.redirect("/login");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.redirect("/login");
        }

        req.user = decoded;
        next();
    });
};





module.exports = router;