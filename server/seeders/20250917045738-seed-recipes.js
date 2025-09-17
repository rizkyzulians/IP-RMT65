"use strict";
require("dotenv").config();
const axios = require("axios");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    let allMeals = [];

    for (const letter of alphabet) {
      try {
        const response = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
        );

        if (response.data.meals) {
          allMeals = allMeals.concat(response.data.meals);
        }
      } catch (err) {
        console.error(`Error fetching meals for '${letter}':`, err.message);
      }
    }

    const batchRecipes = allMeals.map((recipe) => ({
      title: recipe.strMeal,
      image: recipe.strMealThumb,
      summary: "-",
      instructions: recipe.strInstructions,
      ingredients: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        .map((number) => recipe[`strIngredient${number}`])
        .filter(Boolean)
        .join(","),
      spoonacularId: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    console.log(batchRecipes, "<<< batchRecipes");

    await queryInterface.bulkInsert("Recipes", batchRecipes, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Recipes", null, {});
  },
};
