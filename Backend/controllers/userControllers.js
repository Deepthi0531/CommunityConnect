const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const userId = await User.create(req.body);
    res.json({ message: "User created ✅", userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
