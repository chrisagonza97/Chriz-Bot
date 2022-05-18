//for each user for paper trading you need
//1. user_id
//2. score
//3. cash balance
//4. List of stocks owned (and how much of each stock)(which will be a separate table where all owned stocks will be stored)
module.exports = (sequelize, Datatypes) => {
  return sequelize.define('tictactoe', {
    user_id: {
      type: Datatypes.INTEGER,
      allowNull: false,
    },
    guild_id: {
      type: Datatypes.INTEGER,
      allowNull: false,
    },
    score: {
      type: Datatypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    cash_balance: {
      type: Datatypes.FLOAT,
      defaultValue: 10000.0,
    },
  });
};
