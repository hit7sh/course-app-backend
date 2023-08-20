const jwt = require('jsonwebtoken');

const userKey = 'My#&(K&E)Y~`', adminKey = 'AD&#$^(*#^$1`';

function generateAdminToken(admin) {
  return jwt.sign(admin, adminKey, {expiresIn:'24h'});
}
function authenticateAdmin(req, res, next) {
  let token = req.headers.authorization;
  if (!token) res.status(400).send({error:'Bad request'});

  token = token.split(' ')[1];
  jwt.verify(token, adminKey, (err, og) => {
    if (err) res.status(400).send({error:'Internal Server Error!'});
    else {
      req.admin = og;
      next();
    }
  });
}

function generateUserToken(user) {
  return jwt.sign(user, userKey, {expiresIn:'24h'});
}
function authenticateUser(req, res, next) {
  let token = req.headers.authorization;
  if (!token) res.status(400).send({error:'Bad request'});

  token = token.split(' ')[1];
  jwt.verify(token, userKey, (err, og) => {
    if (err) res.status(400).send({error:'Internal Server Error!'});
    else {
      req.user = og;
      next();
    }
  });
}

module.exports = {
    generateAdminToken,
    authenticateAdmin,
    generateUserToken,
    authenticateUser
};