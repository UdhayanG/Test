const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('../_helpers/send-email');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    addphone,
    addemail,
    addaddress
    
};

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.scope('withHash').findOne({ where: { email } });

    if (!account || !account.isVerified || !(await bcrypt.compare(password, account.passwordHash))) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    console.log("bbbbbbbbbb"+token);
    const refreshToken = await getRefreshToken(token);
    console.log("refresh"+JSON.stringify(refreshToken));
    const account = await getAccount(refreshToken.usersTableUsersId);

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

/*async function register(params, origin) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    // create account object
    const account = new db.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await db.Account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = await hash(params.password);
    account.userName= params.userName;
    //added for avoiding the mail verification need to be remove in future
   // account.verified=Date.now();

    // save account
    await account.save();

    // send email
    await sendVerificationEmail(account, origin+'');
}*/
async function register(params, origin) {
      // create User object
    const user = new db.User(params);   
    const phone = new db.Phone(params);
    const phoneUser = new db.phoneUser(params);
    const login = new db.Login(params);
    const loginUser = new db.loginModel(params);
    const email= new db.Email(params);
    const emailUser= new db.emailUser(params);
    
    var logintypeObject =null;
        
        if(params.hasOwnProperty('PhoneNumber')){ 
            const phoneTypeObject = await db.phoneType.findOne({ where: { PhoneNoTypeDesc: 'Mobile' } });
            const countryObject = await db.countryModel.findOne({ where: { CountryName: 'India' } });
            logintypeObject = await db.loginType.findOne({ where: { LoginTypeDesc: 'Phone' } });
            phone.CountryID=countryObject.CountryID;
            phone.NumberinInterForm=0;
            phone.PhoneNoTypeID=phoneTypeObject.PhoneNoTypeID;
        
            await phone.save().then(async function(phoneResult){
                this.phoneId=phoneResult.PhoneNoID;
                user.DefaultPhoneID=this.phoneId;

                    await user.save().then(async function(userResult){
                        this.usetId=userResult.UserID;
                        phoneUser.UserID=this.usetId;
                        phoneUser.PhoneNoID=this.phoneId;
                        await phoneUser.save();

                        login.UserName = params.PhoneNumber;
                        login.LoginTypeID=logintypeObject.LoginTypeID;
                        login.UserNameVerified= 0;
                        login.LoginPassword=params.LoginPassword;
                        login.LoginPasswordSalt=await hash(params.LoginPassword);
                        await login.save().then(async function(loginResult){
                            this.loginId=loginResult.LoginID;
                            loginUser.UserID=this.usetId;
                            loginUser.LoginID=this.loginId;
                            await loginUser.save();
                        
                        });
                    }); 
            });
        }

        if(params.hasOwnProperty('EmailAddress')){ 
            logintypeObject = await db.loginType.findOne({ where: { LoginTypeDesc: 'Email' } });
                    await user.save().then(async function(userResult){
                        this.usetId=userResult.UserID;

                        await email.save().then(async function(emailResult){
                            this.emailId=emailResult.EmailID;
                            emailUser.UserID=this.usetId;
                            emailUser.EmailID=this.emailId;
                            await emailUser.save();
                           
                        });
                        
                        login.UserName = params.EmailAddress;
                        login.LoginTypeID=logintypeObject.LoginTypeID;
                        login.UserNameVerified= 0;
                        login.LoginPassword=params.LoginPassword;
                        login.LoginPasswordSalt=await hash(params.LoginPassword);
                        await login.save().then(async function(loginResult){
                            this.loginId=loginResult.LoginID;
                            loginUser.UserID=this.usetId;
                            loginUser.LoginID=this.loginId;
                            await loginUser.save();
                        
                        });
                    }); 
            
        }

}


async function socialRegister(params, origin) {
    // validate login userName
    if (await db.loginModel.findOne({ where: { UserName: params.email } })) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    if (await db.Email.findOne({ where: { EmailAddress: params.email } })) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }






    // create account object
    const account = new db.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await db.Account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = await hash(params.password);
    account.userName= params.userName;
    //added for avoiding the mail verification need to be remove in future
   // account.verified=Date.now();

    // save account
    await account.save();

    // send email
    await sendVerificationEmail(account, origin+'');
}

async function addphone(reqphoneobject, Users_id) {
    user = await getUser(Users_id);
    await phoneDuplicateCheck(reqphoneobject.PhoneNumber);
    await addnewphone(reqphoneobject,user);    
}

async function addemail(reqemailobject, Users_id) {
    user = await getUser(Users_id);
    await emailDuplicateCheck(reqemailobject.EmailAddress);
    await addnewemail(reqemailobject,user);    
}
async function addaddress(reqaddressobject, Users_id) {
    user = await getUser(Users_id);
    await addnewaddress(reqaddressobject,user);    
}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ where: { verificationToken: token } });

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = null;
    await account.save();
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ where: { email } });

    // always return ok response to prevent email enumeration
    if (!account) return;

    // create reset token that expires after 24 hours
    account.resetToken = randomTokenString();
    account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000);
    await account.save();

    // send email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });

    if (!account) throw 'Invalid token';

    return account;
}

async function resetPassword({ token, password }) {
    const account = await validateResetToken({ token });

    // update password and remove reset token
    account.passwordHash = await hash(password);
    account.passwordReset = Date.now();
    account.resetToken = null;
    await account.save();
}

async function getAll() {
    const accounts = await db.Account.findAll();
    return accounts.map(x => basicDetails(x));
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const account = new db.Account(params);
    account.verified = Date.now();

    // hash password
    account.passwordHash = await hash(params.password);

    // save account
    await account.save();

    return basicDetails(account);
}

async function update(Users_id, params) {
    userObject=[];
    var user=null;
    var phone =null;
    var email =null;
    var address=null;
    var login=null;
    var isPhoneAvailable = false;
    
        user = await getUser(Users_id);
        console.log("userObject=========>"+JSON.stringify(user));
    

    if(params.hasOwnProperty('Phone')){
         isPhoneAvailable= await isPhoneUser(Users_id);
        if(isPhoneAvailable===true){
            await phoneDuplicateCheck(params.Phone.PhoneNumber);
            phone = await getPhoneNumber(Users_id,params.Phone);
        }else{
            const newphone = new db.Phone(params.Phone);
            const countryObject = await db.countryModel.findOne({ where: { CountryName: 'India' } });
            const phoneTypeObject = await db.phoneType.findOne({ where: { PhoneNoTypeDesc: 'Mobile' } });
            newphone.CountryID=countryObject.CountryID;
            newphone.NumberinInterForm=0;
            newphone.PhoneNoTypeID=phoneTypeObject.PhoneNoTypeID;
            newphone.save().then(async function(phoneResult){
                const phoneUser = new db.phoneUser();
                phoneUser.PhoneNoID=phoneResult.PhoneNoID;
                phoneUser.UserID=Users_id;
                    if(user.DefaultPhoneID==null){
                        user.DefaultPhoneID= phoneResult.PhoneNoID;
                        await user.save();
                    }    
                phoneUser.save();            
            });
        }
       
    }

    if(params.hasOwnProperty('Email')){

        isEmailAvailable= await isEmailUser(Users_id);

        if(isEmailAvailable===true){
            await emailDuplicateCheck(params.Email.EmailAddress);
            email = await getEmail(Users_id,params.Email);  
        }else{
           const newEmail= new db.Email(params.Email);
           newEmail.save().then(async function(emailresult){
                const emailUser= new db.emailUser();
                emailUser.EmailID=emailresult.EmailID;
                emailUser.UserID=Users_id;
                emailUser.save();
            });           
        }
    }

    if(params.hasOwnProperty('Address')){
         isAddressAvailable= await isAddressUser(Users_id);
       // isAddressAvailable=false;
        if(isAddressAvailable===true){
            address = await getAddress(Users_id,params.Address);
        }else{
            const newaddress=new db.Address(params.Address);
            console.log("else address save======>");
            await newaddress.save().then(async function (addressObject) {
               const addressUser=new db.userAddress(); 
               console.log("addressObject======>"+JSON.stringify(addressObject));
               addressUser.AddressID=addressObject.AddressID;
               console.log(" addressUser.AddressID======>"+JSON.stringify(addressUser.AddressID));
               
                    if(user.DefaultAddressID==null){
                        console.log(" Default.AddressID======>");
                        user.DefaultAddressID= addressUser.AddressID;
                        console.log(" Default.After======>");
                        await user.save();
                    }
                           
               addressUser.UserID= Users_id;
               await addressUser.save();                
            });
        }
               
    }

    if(params.hasOwnProperty('Login')){
        await userNameDuplicateCheck(params.Login.UserName)
        login = await getLogin(Users_id);
    }

    //update user
    if(user!=null){   
        console.log("user===========>before update"+JSON.stringify(user));
        Object.assign(user, params.User);
        await user.save();
        userObject.push({"userObject":user});
    }

   //update phone
   if(phone!=null){  
        Object.assign(phone, params.Phone);
        await phone.save();   
        userObject.push({"phoneObject":phone});  
   }

   //update email
   if(email!=null){
        Object.assign(email, params.Email);
        await email.save();  
        userObject.push({"emailObject":email}); 
   }

    //update address
    if(address!=null){
    console.log("upadate================>");
    Object.assign(address, params.Address);
    await address.save();  
    userObject.push({"addressObject":address});  
    }

    //update login
    if(login!=null){
    Object.assign(login, params.Login);
    await login.save();  
    userObject.push({"loginObject":login});  
    }

    return userObject;

    
}

async function getUser(userId) {
    const user = await db.User.findByPk(userId);
    if (!user) throw 'User not found';
    return user;
}

async function isPhoneUser(userId) {
    var phoneUserObj; 
    try{   
     phoneUserObj = await db.phoneUser.findByPk(userId);
     if(phoneUserObj){return true;}
     else{return false;}
    }
    catch(err){
        console.log("err============"+err)
        return false;

    }    
}

async function isEmailUser(userId) {
    var emailUserObj; 
    try{   
        emailUserObj = await db.emailUser.findByPk(userId);
     if(emailUserObj){return true;}
     else{return false;}
    }
    catch(err){
        console.log("err============"+err)
        return false;

    }    
}
async function isAddressUser(userId) {
    var addressUserObj; 
    try{   
        addressUserObj = await db.userAddress.findByPk(userId);
     if(addressUserObj){return true;}
     else{return false;}
    }
    catch(err){
        console.log("err============"+err)
        return false;

    }    
}



async function phoneDuplicateCheck(phoneNumber) {

    const phoneObj = await db.Phone.findAll({
        where:{PhoneNumber:phoneNumber}
    });

    if(phoneObj.length>0){
        throw "phone number already in use, please enter another valid phone number";
    }
    
    return phoneObj;
}

async function emailDuplicateCheck(email) {

    const emailObj = await db.Email.findAll({
        where:{EmailAddress:email}
    });

    if(emailObj.length>0){
        throw "email address already in use, please enter another valid email address";
    }
    
    return emailObj;
}

async function userNameDuplicateCheck(userName) {

    const loginObj = await db.Login.findAll({
        where:{UserName:userName}
    });

    if(loginObj.length>0){
        throw "User Name already in use, please enter another valid User Name";
    }
    
    return loginObj;
}


async function getPhoneNumber(userId,phoneObject) {
    try{
    const phoneUserObj = await db.phoneUser.findOne({ where: { UserID: userId,PhoneNoID:phoneObject.PhoneNoID}});
    const phoneObj = await db.Phone.findByPk(phoneUserObj.PhoneNoID);
    if (!phoneObj) throw 'Phone Details not found';
    return phoneObj;
    }catch(err){
            
        const saveNewPhone = new db.Phone(phoneObject);
        await saveNewPhone.save().then(async function(newPhoneObject){
            const saveNewUserPhone=new db.phoneUser();
            saveNewUserPhone.UserID=userId;
            saveNewUserPhone.PhoneNoID=newPhoneObject.PhoneNoID;
        await saveNewUserPhone.save()

        });

        console.log("newAddressObject============>"+JSON.stringify(saveNewPhone));
        return saveNewPhone;

    }
}


async function getEmail(userId,userEmail) {
    try{
    const emailUserObj = await db.emailUser.findOne({ where: { UserID: userId,EmailID:userEmail.EmailID }});
    const emailObj = await db.Email.findByPk(emailUserObj.EmailID);
    if (!emailObj) throw 'Email Details not found';
    return emailObj;
    }catch(err){
        const saveNewEmail = new db.Email(userEmail);
        await saveNewEmail.save().then(async function(newEmailObject){
            const saveNewEmailUser=new db.emailUser();
            saveNewEmailUser.UserID=userId;
            saveNewEmailUser.EmailID=newEmailObject.EmailID;
            await saveNewEmailUser.save();
        });

        console.log("newAddressObject============>"+JSON.stringify(saveNewEmail));
        return saveNewEmail;
    }
}

async function getAddress(userId,userAddressObject) {
    try{
    const addressUserObj = await db.userAddress.findOne({ where: { UserID: userId,AddressID:userAddressObject.AddressID } });
    const addressObj = await db.Address.findByPk(addressUserObj.AddressID);
    if (!addressObj) throw 'Address Details not found';
    return addressObj;
    }catch(err){
        
        const saveNewAddress = new db.Address(userAddressObject);
        await saveNewAddress.save().then(async function(newAddressObject){
            const saveNewUserAddress=new db.userAddress();
            saveNewUserAddress.UserID=userId;
            saveNewUserAddress.AddressID=newAddressObject.AddressID;
           await saveNewUserAddress.save()

        });

        console.log("newAddressObject============>"+JSON.stringify(saveNewAddress));
        return saveNewAddress;

    }
   
    
}

async function getLogin(userId) {
    const loginUserObj = await db.loginModel.findByPk(userId);
    const loginObj = await db.Login.findByPk(loginUserObj.LoginID,{attributes: {
         exclude: ['LoginPassword','LoginPasswordSalt'] // define columns that you don't want 
      }});
    if (!loginObj) throw 'Login Details not found';
    return loginObj;
}

async function addnewphone(phoneObject,userObject) {
    const newphone = new db.Phone(phoneObject);
    const countryObject = await db.countryModel.findOne({ where: { CountryName: 'India' } });
    const phoneTypeObject = await db.phoneType.findOne({ where: { PhoneNoTypeDesc: 'Mobile' } });
    newphone.CountryID=countryObject.CountryID;
    newphone.NumberinInterForm=0;
    newphone.PhoneNoTypeID=phoneTypeObject.PhoneNoTypeID;
    newphone.save().then(async function(phoneResult){
        const phoneUser = new db.phoneUser();
        phoneUser.PhoneNoID=phoneResult.PhoneNoID;
        phoneUser.UserID=userObject.UserID;
            if(userObject.DefaultPhoneID==null){
                userObject.DefaultPhoneID= phoneResult.PhoneNoID;
                await user.save();
            }    
        phoneUser.save();            
    });

}
async function addnewemail(emailObject,userObject) {
    const newEmail= new db.Email(emailObject);
    newEmail.save().then(async function(emailresult){
        const emailUser= new db.emailUser();
        emailUser.EmailID=emailresult.EmailID;
        emailUser.UserID=userObject.UserID;
        emailUser.save();
    });
}
async function addnewaddress(addressObject,userObject) {
    const newaddress=new db.Address(addressObject);
    await newaddress.save().then(async function (addressObjectresult) {
        const addressUser=new db.userAddress(); 
        addressUser.AddressID=addressObjectresult.AddressID;
            if(userObject.DefaultAddressID==null){
                user.DefaultAddressID= addressObjectresult.AddressID;
                await user.save();
            }
        addressUser.UserID= userObject.UserID;
        await addressUser.save();                
    });

}






/*async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}*/

async function _delete(useId) {
    const loginUserObj = await db.loginModel.findByPk(useId);
    const loginObj = await db.Login.findByPk(loginUserObj.LoginID);
    if (!loginObj) throw 'User Details Details not found';
    else{
        loginObj.UserNameVerified=2;
        await loginObj.save();
        return "User Account Deleted Successfully";

    }
   
}

// helper functions

async function getAccount(id) {
    const account = await db.Account.findByPk(id);
    if (!account) throw 'Account not found';
    return account;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

async function hash(password) {
    return await bcrypt.hash(password, 10);
}

function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: account.id, id: account.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress,
        usersTableUsersId:account.Users_id
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { Users_id, title, firstName, lastName, email, role, created, updated, isVerified,userAddress,userPhone } = account;
    return { Users_id, title, firstName, lastName, email, role, created, updated, isVerified ,userAddress,userPhone};
}

async function sendVerificationEmail(account, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
    } else {
        message = `<p>If you don't know your password you can reset it via the <code>/account/forgot-password</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'Sign-up Verification API - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
}

async function sendPasswordResetEmail(account, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/account/reset-password?token=${account.resetToken}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${account.resetToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
}