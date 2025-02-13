module.exports = (req, res) => {
  res.status(404).json({ message: "Service is not found" });
};
