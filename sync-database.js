const Sequelize = require('sequelize');

const sequelize = new Sequelize('discordbot', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'database.sqlite',
});

require('./models/stocks-owned.js')(sequelize, Sequelize.DataTypes);
require('./models/tictactoe.js')(sequelize, Sequelize.DataTypes);

sequelize
  .sync({ force: true })
  .then(async () => {
    console.log('Database synced');
    sequelize.close();
  })
  .catch(console.error);
