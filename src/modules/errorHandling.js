module.exports = (err, req, res, next) => {
  console.error(`${(new Date()).toISOString()}, Something bad happened: ${err}`);
  if (err instanceof URIError) {
    res.redirect('/error');
  }
  next();
};
