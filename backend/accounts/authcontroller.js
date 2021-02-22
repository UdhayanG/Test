const express = require('express');
const router = express.Router();
const accountService = require('./authenticate.service');
const bcrypt = require('bcryptjs');
var session = require('express-session');
const { QueryTypes } = require('sequelize');
var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
var sess;  

router.post('/authenticate', authenticate);
router.get('/getallusers', getallusers);
//const db = require('_helpers/db');
const db = require('../_helpers/db')
const config = require('../config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
module.exports = router;


async function authenticate (request, response,next) {
   console.log("req======"+JSON.stringify(request.body));
	var username = request.body.UserName;
    var password = request.body.LoginPassword;
    var loginToken;

    const loginObject = await db.Login.findOne({ where: { UserName: username } });

    if (!loginObject || !(await bcrypt.compare(password, loginObject.LoginPasswordSalt))) {
       
        response.send('Email or password is incorrect');
    }
    else{

        sess = request.session;
        sess.username=request.body.UserName;
       loginToken =  getToken(request.body.UserName);
       sess.loginToken=loginToken;
      console.log("logingintoken=========="+JSON.stringify(loginToken));
       

        await db.loginModel.findOne({
            attributes: ['UserID'],
            where: {LoginID: loginObject.LoginID}                       
    
    }).then(async function (loginUsers) {

        sess.loginUsers=loginUsers;

           // console.log("unnalke======="+JSON.stringify(loginUsers.UserID));
            this.userId=loginUsers.UserID;
            });
          
            this.userObject= await db.User.findOne({
                where:{UserID:this.userId}
            });
            sess.userObject= this.userObject;
            this.emailId= await db.emailUser.findOne({
                attributes: ['EmailID'],
                where:{UserID:this.userId}
            }).then(async function(emailUsers){
                console.log("emailID======="+JSON.stringify(emailUsers));
                if(emailUsers==null){
                    
                    sess.EmailID= '';

                }
                else{
                    sess.EmailID= emailUsers.EmailID;
                    this.email= await db.Email.findOne({
                        attributes: ['EmailAddress'],
                        where:{EmailID:emailUsers.EmailID}
                    })
                    //console.log("emaildetailssss======="+JSON.stringify(this.email.EmailAddress));

                }
            });

            this.phoneId= await db.phoneUser.findOne({
                attributes: ['PhoneNoID'],
                where:{UserID:this.userId}
            }).then(async function(phoneUsers){

                if(!phoneUsers){
                   this.phoneObject=0;

                }else{
                    this.phoneObject= await db.Phone.findOne({
                        where:{PhoneNoID:phoneUsers.PhoneNoID}
                    })

                }
                sess.phoneObject= this.phoneObject;
                console.log("phoneObject==========>"+this.phoneObject)
                
               
            });


            this.addressId= await db.userAddress.findOne({
                attributes: ['AddressID'],
                where:{UserID:this.userId}
            }).then(async function(addressUsers){

                if(!addressUsers){                   
                    this.addressObject=null;

                }else{
                    this.addressObject= await db.Address.findOne({
                        where:{AddressID:addressUsers.AddressID}
                    }).then(async function(address){

                        if(!address){
                            this.countryName=null;

                        }else{
                            this.countryName= await db.countryModel.findOne({
                                where:{CountryID: address.CountryID}
                            })                            
                        }
                        
                    });

                }
            
               // console.log("phoneObject==========>"+this.addressObject);             
               
            });
            sess.country= this.countryName;
            response.json(sess);

            //response.redirect('/home');
    }
    

	/*if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}*/
};

async function getallusers(req, res, next) {

   if(req.body.role=='Admin'){
            try{
                const { host, port, user, password, database } = config.database;
                const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });
                sequelize.query("select * from Users u LEFT JOIN User_Logins ul on u.UserID = ul.UserID LEFT JOIN Logins l on ul.LoginID = l.LoginID LEFT JOIN User_PhoneNumbers up on u.UserID=up.UserID LEFT JOIN PhoneNumbers pn on up.PhoneNoID=pn.PhoneNoID LEFT JOIN User_Emails ue on u.UserID=ue.UserID LEFT JOIN Emails e on ue.EmailID=e.EmailID LEFT JOIN User_Addresses ua on u.UserID=ua.UserID LEFT JOIN Addresses a on ua.AddressID=a.AddressID", { type:Sequelize.QueryTypes.SELECT})
                .then(function(allUserObject) {
                    // res.json(properties)
                    //return ;
                    res.json(allUserObject);
                });
            
            }catch(err){
                console.error(err);

            }
    }
    else{

        res.send('permission denied');
    }
}
function getToken(username){
    let username2 = username;  
    let bufferObj = Buffer.from(username2, "utf8"); 
    let en_token = bufferObj.toString("base64"); 
    return en_token;
   }


router.get('/home', function(request, response) {
   console.log("dfsfsdfsdfsdfsdf"+request.session.Username);
   console.log(request.session.loggedin);

	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.Username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

/*function authenticate(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    accountService.authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
          //  res.json(account);
            res.json({account:account,refreshToken:refreshToken});
        })
        .catch(next);
}*/
