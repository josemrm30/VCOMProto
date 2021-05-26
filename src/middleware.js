const { json } = require('express');
const jwt = require('jsonwebtoken');
const jwtSecret = "probando12345";

const withAuth = function (req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        res.redirect("/unauthorized");
        res.end();
    } else {
        jwt.verify(token, jwtSecret, function (err, decoded) {
            if (err) {
                res.redirect("/unauthorized");
                res.end();
            } else {
                next();
            }
        });
    }
}
module.exports = withAuth;