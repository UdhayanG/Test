const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        EmailID: {type: DataTypes.INTEGER,autoIncrement: true,primaryKey: true},
        EmailAddress: { type: DataTypes.STRING, allowNull: false },
        };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false           
    };
 

    return sequelize.define('Emails', attributes,options);
}