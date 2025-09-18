const { Recipe, MyList, User } = require("../models");
const { Op } = require("sequelize");

module.exports = class recipeController {
  // [GET] /pub/recipes/all (for AI context)
  static async getAllRecipesRaw(req, res, next) {
    try {
      const recipes = await Recipe.findAll({
        attributes: ['id', 'title', 'ingredients']
      });
      res.status(200).json(recipes);
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  // [GET] /pub/recipes
  static async getAllRecipePub(req, res, next) {
    try {
      const { search, sort, page } = req.query;
      let options = {
        include: {
          model: MyList,
        },
        order: [["title", "ASC"]],
        where: {},
      };

      //SEARCH BY tilte
      if (search) {
        options.where.title = { [Op.iLike]: `%${search}%` };
      }

      //SORTING
      if (sort === "oldest") {
        options.order = [["updatedAt", "ASC"]];
      } else if (sort === "newest") {
        options.order = [["updatedAt", "DESC"]];
      }

      //PAGINATION
      const limit = 10;
      const pageNum = page ? +page : 1;
      const offset = (pageNum - 1) * limit;

      options.limit = limit;
      options.offset = offset;

      const recipes = await Recipe.findAll(options);
      res.status(200).json(recipes);
    } catch (err) {
      console.log(err.message, "<<< errrrrrrrr");

      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
  }

  // [GET] pub/recipes/:id
  static async detailRecipePubbyId(req, res, next) {
    const recipesId = req.params.id;
    try {
      const recipe = await Recipe.findByPk(recipesId);
      if (!recipe) {
        res.status(404).json({ message: "Data not found" });
        return;
      }
      res.status(200).json(recipe);
    } catch (err) {
      console.log(err.message, "<<< errrrrrrrr");

      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
  }
};
