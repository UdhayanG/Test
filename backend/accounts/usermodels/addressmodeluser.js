const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        UserID: { type: DataTypes.INTEGER, allowNull: false,primaryKey: true },
        AddressID: { type: DataTypes.INTEGER, allowNull: false,primaryKey: true },
       };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false           
    };


    

    return sequelize.define('User_Addresses', attributes,options);
}