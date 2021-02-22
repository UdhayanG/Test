 
const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        PhoneNoTypeID: {type: DataTypes.INTEGER,autoIncrement: true,primaryKey: true},
        PhoneNoTypeDesc: { type: DataTypes.STRING, allowNull: false },
        };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false           
    };


    

    return sequelize.define('PhoneNoTypes', attributes,options);
   
}