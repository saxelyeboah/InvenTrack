const userService = require('../services/userService');

class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const newUser = await userService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const updated = await userService.toggleUserStatus(id, is_active);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
