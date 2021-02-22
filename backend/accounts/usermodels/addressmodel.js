const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        AddressID: {type: DataTypes.INTEGER,autoIncrement: true,primaryKey: true},
        Address: { type: DataTypes.STRING, allowNull: true },
        Town: { type: DataTypes.STRING, allowNull: true },
        State: { type: DataTypes.STRING, allowNull: true },
        CountryID: { type: DataTypes.INTEGER, allowNull: false },
        PostCode: { type: DataTypes.STRING, allowNull: true },
    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false           
    };


    

    return sequelize.define('Addresses', attributes,options);
}