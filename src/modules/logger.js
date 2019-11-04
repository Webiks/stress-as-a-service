module.exports = (req, res, next) => {
  // task: save to a file
  console.log(`${(new Date()).toISOString()},  URL: ${req.method} ${req.url}`);
  next();
};
