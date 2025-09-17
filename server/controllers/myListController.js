const { MyList, Recipe, User } = require('../models');

class MyListController {
  // 1. Get all recipes in user's my list, including notes
  static async getMyList(req, res) {
    try {
      const userId = req.user.id;
      const myList = await MyList.findAll({
        where: { UserId: userId },
        include: [{
          model: Recipe,
          attributes: { exclude: ['createdAt', 'updatedAt'] }
        }],
        attributes: ['id', 'RecipeId', 'note']
      });
      res.json({ myList });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }

  // 2. Add recipe to my list (with optional notes)
  static async addToMyList(req, res) {
    try {
      const userId = req.user.id;
      console.log(userId, "<<<<<<<<user");
      
      const { RecipeId, note } = req.body;
      console.log(RecipeId, note, "<<<<<<<<<<<<<<<<< ini req.body");
      
      // Check if already exists
      const exists = await MyList.findOne({ where: { UserId: userId, RecipeId } });
      if (exists) {
        return res.status(400).json({ message: 'Recipe already in your list' });
      }
      const newEntry = await MyList.create({ UserId: userId, RecipeId, note });
      console.log(newEntry, "<<<<<<<<<<<<<<<<< ini newEntry");
      
      res.status(201).json({ message: 'Recipe added to my list', myList: newEntry });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }

  // 3. Remove recipe from my list by RecipeId
  static async removeFromMyList(req, res) {
    try {
      const userId = req.user.id;
      const { RecipeId } = req.params;
      const deleted = await MyList.destroy({ where: { UserId: userId, RecipeId } });
      if (!deleted) {
        return res.status(404).json({ message: 'Recipe not found in your list' });
      }
      res.json({ message: 'Recipe removed from my list' });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }

  // 4. Update notes for a recipe in my list
  static async updateNote(req, res) {
    try {
      const userId = req.user.id;
      const { RecipeId } = req.params;
      const { note } = req.body;
      const myListEntry = await MyList.findOne({ where: { UserId: userId, RecipeId } });
      if (!myListEntry) {
        return res.status(404).json({ message: 'Recipe not found in your list' });
      }
      myListEntry.note = note;
      await myListEntry.save();
      res.json({ message: 'Notes updated', myList: myListEntry });
    } catch (err) {
      res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }
}

module.exports = MyListController;
