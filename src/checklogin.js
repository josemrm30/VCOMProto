const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config()
const jwtSecret = process.env.JWT_SECRET;


const checkLogin = function (req, res, next) {
    try {
        if (req.path.startsWith("/main")) {
            const loged = req.cookies.token || "";
            jsonwebtoken.verify(loged, jwtSecret);
            next();
        }
        else {
            if (req.path.startsWith("/login") || req.path.startsWith("/register")) {
                const loged = req.cookies.token || "";
                if (loged) {
                    return res.redirect("/main");
                }
                else{
                    next();
                }
            }
            else {
                next();
            }
        }
    }
    catch (err) {
        return res.redirect("/logout");
    }
}
module.exports = checkLogin;