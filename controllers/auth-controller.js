module.exports.register = (req, res) => {
  res.json({ message: "Register..." });
};

module.exports.login = (req, res) => {
  res.json({ message: "Login..." });
};

module.exports.getMe = (req, res) => {
  res.json({ message: "Getme..." });
};
