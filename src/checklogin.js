const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = "probando12345";


const checkLogin = function (req, res, next) {
    try {
        if (req.path.startsWith("/main")) {
            const loged = req.cookies.token || "";
            jsonwebtoken.verify(loged, jwtSecret);
            next();
        }
        else {
            next();
        }
    }
    catch (err) {
        return res.redirect("/logout");
    }
}
module.exports = checkLogin;