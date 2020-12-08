const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authcookie = req.cookies.authcookie;
        const decoded = jwt.verify(authcookie, "secret");
        req.userData = decoded;
        next();
    } catch (error) {
        return res.render('login')
    }
};