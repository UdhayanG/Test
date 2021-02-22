const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        UserID: { type: DataTypes.INTEGER, allowNull: false,primaryKey: true },
        PhoneNoID: { type: DataTypes.INTEGER, allowNull: false,primaryKey: true },
       };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false           
    };


    

    return sequelize.define('User_PhoneNumbers', attributes,options);
}
