module.exports = (err, req, res, next) => {
  console.error(`Something bad happened: ${err}`);
  if (err instanceof URIError) {
    res.redirect('/error');
  }
  next();
};