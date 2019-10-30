module.exports = (req, res, next) => {
  // task: save to a file
  console.log(`Time:  ${Date.now()} : ${req.url}`);
  next();
};