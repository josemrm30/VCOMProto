const jsonwebtoken = require('jsonwebtoken');
const { redirect } = require('next/dist/next-server/server/api-utils');
const jwtSecret = "probando12345";


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