const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        LoginID: {type: DataTypes.INTEGER,autoIncrement: true,primaryKey: true},
        UserName: { type: DataTypes.STRING, allowNull: false },
        UserNameVerified: { type: DataTypes.INTEGER, allowNull: false },
        LoginTypeID:{ type: DataTypes.INTEGER, allowNull: false },
        LoginPassword: { type: DataTypes.STRING, allowNull: true },
        LoginPasswordSalt: { type: DataTypes.INTEGER, allowNull: true },

    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false           
    };

    return sequelize.define('Logins', attributes,options);
}