'use strict';
const {
  Model
} = require('sequelize');
const { hashPassword } = require('../helpers/bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsToMany(models.Recipe, { foreignKey: 'UserId', through: models.MyList })
      User.hasMany(models.MyList, { foreignKey: 'UserId' })
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email:{ type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Email address already exists!'
      },
      validate: {
        isEmail: { msg: 'Email format is invalid' },
        notEmpty: { msg: 'Email is required' },
        notNull: { msg: 'Email is required' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        notNull: { msg: 'Password is required' },
        len: {
          args: [5],
          msg: 'Password length min 5 characters'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  User.beforeCreate((user) => {
    user.password = hashPassword(user.password)
  })
  return User;
};