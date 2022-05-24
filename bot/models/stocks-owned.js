//for each stock (portion) owned, need ticker name, user-id of owner, and amount owned
module.exports = (sequelize, Datatypes) => {
  return sequelize.define('stocksowned', {
    stock_ticker: {
      type: Datatypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: Datatypes.INTEGER,
      allowNull: false,
    },
    guild_id: {
      type: Datatypes.INTEGER,
      allowNull: false,
    },
    amount_owned: {
      type: Datatypes.FLOAT,
      allowNull: false,
    },
  });
};
