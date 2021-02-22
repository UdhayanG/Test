const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        UserID: {type: DataTypes.INTEGER,autoIncrement: true,primaryKey: true},
        FirstName: { type: DataTypes.STRING, allowNull: false },
        MiddleName: { type: DataTypes.STRING, allowNull: true },
        LastName: { type: DataTypes.STRING, allowNull: true },
        DefaultAddressID: { type: DataTypes.INTEGER, allowNull: true },
        DefaultPhoneID: { type: DataTypes.INTEGER, allowNull: true },
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false
        
    };


    

    return sequelize.define('Users', attributes,options);
}