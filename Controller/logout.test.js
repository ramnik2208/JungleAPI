var express = require('express');
const route = express.Router()

// Sætter 'authcookie' værdi til 0
// Normalt er værdien en token, den sættes til 0 ved logud
test('checks cookie is set to logout value', () => {
  route.post("/logout", (req, res, next) => {
    let cookie = res.cookie('authcookie','',{ maxAge:1 });
    expect(cookie).toBe(res.cookie('authcookie','',{ maxAge:1 }))
  })
});