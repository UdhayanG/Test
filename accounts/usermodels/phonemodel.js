const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        PhoneNoID: {type: DataTypes.INTEGER,autoIncrement: true,primaryKey: true},
        CountryID: { type: DataTypes.INTEGER, allowNull: false },
        PhoneNumber: { type: DataTypes.INTEGER, allowNull: false },
        NumberinInterForm: { type: DataTypes.INTEGER, allowNull: false },
        PhoneNoTypeID: { type: DataTypes.INTEGER, allowNull: false },

    };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false           
    };

    return sequelize.define('PhoneNumbers', attributes,options);
}