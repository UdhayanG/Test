const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

      // init models and add them to the exported db object
   // db.Account = require('../accounts/account.model')(sequelize);
   // db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);
    db.User = require('../accounts/usermodels/usermodel')(sequelize);
    db.Address = require('../accounts/usermodels/addressmodel')(sequelize);
    db.userAddress = require('../accounts/usermodels/addressmodeluser')(sequelize);
    db.countryModel = require('../accounts/usermodels/countrymodel')(sequelize);
    db.Login = require('../accounts/usermodels/loginmodel')(sequelize);
    db.loginType = require('../accounts/usermodels/logintypemodel')(sequelize);
    db.loginModel = require('../accounts/usermodels/logoinusermodel')(sequelize);    
    db.phoneType = require('../accounts/usermodels/phonetypemodel')(sequelize);
    db.Phone = require('../accounts/usermodels/phonemodel')(sequelize);
    db.phoneUser = require('../accounts/usermodels/phonemodeluser')(sequelize);
    db.Email = require('../accounts/usermodels/emailmodel')(sequelize);
    db.emailUser = require('../accounts/usermodels/emailuser')(sequelize);
    
    
    //db.countryModel = require('../accounts/usermodels/phonemodeemailmodelluser')(sequelize);       
    

    // define relationships

    




   

    //db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
   // db.RefreshToken.belongsTo(db.Account);
   //db.User.hasMany()


    
    
    // sync all models with database
    await sequelize.sync();
}