
const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        LoginTypeID: {type: DataTypes.INTEGER,autoIncrement: true,primaryKey: true},
        LoginTypeDesc: { type: DataTypes.STRING, allowNull: false },
        };

    const options = {
        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: false           
    };
 

    return sequelize.define('LoginTypes', attributes,options);
   
}