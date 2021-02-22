const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        CountryID: {type: DataTypes.INTEGER,autoIncrement: true,primaryKey: true},
        CountryName: { type: DataTypes.STRING, allowNull: false },
        PhonePrefix: { type: DataTypes.INTEGER, allowNull: false },
       };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false           
    };


    

    return sequelize.define('Countries', attributes,options);
}