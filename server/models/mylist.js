'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MyList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MyList.belongsTo(models.User, { foreignKey: 'UserId' })
      MyList.belongsTo(models.Recipe, { foreignKey: 'RecipeId'})
    }
  }
  MyList.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    RecipeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'MyList',
  });
  return MyList;
};