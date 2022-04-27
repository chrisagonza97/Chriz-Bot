module.exports = (sequelize, Datatypes) => {
    return sequelize.define('tictactoe', {
        user_id: {
            type: Datatypes.INTEGER,
            primaryKey: true,
        },
        score: {
            type: Datatypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        }
    })
}