const requestLogger = (req, _, next) => {
  console.log(req.method, req.url);
  next();
};

module.exports = { requestLogger };
