const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const Role = require('../_helpers/role');
const accountService = require('./account.service');
//const { ConditionalExpr } = require('@angular/compiler');

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/refresh-token', refreshToken);
router.post('/currentuser', currentuser);
router.post('/revoke-token', authorize(), revokeTokenSchema, revokeToken);
router.post('/registeremail', registerSchema, register);
router.post('/registerphone', registerphoneSchema, register);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.post('/forgot-password', forgotPasswordSchema, forgotPassword);
router.post('/validate-reset-token', validateResetTokenSchema, validateResetToken);
router.post('/reset-password', resetPasswordSchema, resetPassword);
router.get('/', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), createSchema, create);
//router.put('/:id', authorize(), updateSchema, update);
router.put('/:Users_id', update);
router.put('/inactive/:Users_id', inActive);
router.delete('/:id', authorize(), _delete);
router.post('/socialRegister', socialRegister);
//add phone number
router.post('/addphone/:Users_id',phonevaidation, addphone);
//add email address
router.post('/addemail/:Users_id',emailvalidation, addemail);
//add user address
router.post('/addaddress/:Users_id',addressvalidation, addaddress);


module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    accountService.authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
          //  res.json(account);
            res.json({account:account,refreshToken:refreshToken});
        })
        .catch(next);
}

function currentuser(req, res, next) {
    const token = req.body.params;
    console.log("refreshToken========="+JSON.stringify(token));

    const ipAddress = req.ip;
    accountService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json({account:account,refreshToken:refreshToken});
        })
        .catch(next);
}

function refreshToken(req, res, next) {
    const token = req.body.params;
    console.log("refreshToken========="+JSON.stringify(token));

    const ipAddress = req.ip;
    accountService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

function revokeTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    // users can revoke their own tokens and admins can revoke any tokens
    if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}

function registerSchema(req, res, next) {
    //console.log("validation req.body"+JSON.stringify(req.body));
    const schema = Joi.object({
        //title: Joi.string().required(),
        FirstName: Joi.string().required(),
        //LastName: Joi.string().required(),
        //MiddleName:Joi.string().allow(null, ''),
        EmailAddress: Joi.string().email().required(),
        LoginPassword: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('LoginPassword')).required(),

        //acceptTerms: Joi.boolean().valid(true).required()
    });
    validateRequest(req, next, schema);
}

function registerphoneSchema(req, res, next) {
   // console.log("validation req.body"+JSON.stringify(req.body));
    const schema = Joi.object({
        //title: Joi.string().required(),
        FirstName: Joi.string().required(),
      //  LastName: Joi.string().required(),
       // MiddleName:Joi.string().allow(null, ''),
        PhoneNumber: Joi.string().required(),
        LoginPassword: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('LoginPassword')).required(),
        //acceptTerms: Joi.boolean().valid(true).required()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    console.log("register req.body"+JSON.stringify(req.body));

    accountService.register(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Registration successful, please check your email for verification instructions' }))
        .catch(next);
}

function socialRegister(req, res, next) {
    accountService.socialRegister(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Registration successful, please check your email for verification instructions' }))
        .catch(next);
}

//for social login
/*function socialRegisterSchema(req, res, next) {
    const schema = Joi.object({

        firstName: Joi.string().required(),
        userName: Joi.string().required(),
        email: Joi.string().email().required()             
    });
    validateRequest(req, next, schema);
    res.json(req);
}
*/

//function socialRegister(req, res, next) {
    //accountService.register(req.body, req.get('origin'))
     //   .then(() => res.json({ message: 'Registration successful, please check your email for verification instructions' }))
     //   .catch(next);
     //res.json(req);
//}
/* for social login  ended*/ 


function verifyEmailSchema(req, res, next) {
    console.log("req.bodySchema====="+JSON.stringify(req.body.params));
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function verifyEmail(req, res, next) {
    console.log("req.body"+req.body);
    accountService.verifyEmail(req.body)
        .then(() => res.json({ message: 'Verification successful, you can now login' }))
        .catch(next);
}

function forgotPasswordSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    validateRequest(req, next, schema);
}

function forgotPassword(req, res, next) {
    accountService.forgotPassword(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
        .catch(next);
}

function validateResetTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function validateResetToken(req, res, next) {
    accountService.validateResetToken(req.body)
        .then(() => res.json({ message: 'Token is valid' }))
        .catch(next);
}

function resetPasswordSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema);
}

function resetPassword(req, res, next) {
    accountService.resetPassword(req.body)
        .then(() => res.json({ message: 'Password reset successful, you can now login' }))
        .catch(next);
}

function getAll(req, res, next) {
    accountService.getAll()
        .then(accounts => res.json(accounts))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own account and admins can get any account
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.getById(req.params.id)
        .then(account => account ? res.json(account) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
       // title: Joi.string().required(),
        firstName: Joi.string().required(),
       // lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        role: Joi.string().valid(Role.Admin, Role.User).required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    accountService.create(req.body)
        .then(account => res.json(account))
        .catch(next);
}

/*function updateSchema(req, res, next) {
    console.log("initial response===========>",JSON.stringify(req.body));
    const schemaRules = {
        title: Joi.string().empty(''),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        userAddress:Joi.string().min(6).empty(''),
        userPhone:Joi.string().min(6).empty(''),
        userDOB:Joi.date().allow('').allow(null),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty('')
    };

    // only admins can update role
    if (req.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}*/
function updateSchema(req, res, next) {
    console.log("initial response===========>",JSON.stringify(req.params));
    const schemaRules=null;
    if(req.body.hasOwnProperty('User')){
        
        console.log("req.body.User================>"+JSON.stringify(req.body.User));
        try{
            schemaRules = Joi.object().keys({
                User: Joi.object().keys({
                    FirstName: Joi.string().required,
                    MiddleName: Joi.string().required,
                    LastName: Joi.string().required,
                })
            });
        }catch(err){
            console.log(err);

        }
                
        const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
        validateRequest(req, next, schema,{ allowUnknown: true });

    } 
    
    
}

/*function update(req, res, next) {
    // users can update their own account and admins can update any account
    console.log('req.params'+JSON.stringify(req.params));
    console.log('req.body'+JSON.stringify(req.body));
    

    accountService.update(req.params.Users_id, req.body)
        .then(account => res.json(account))
        .catch(next);
}*/

function update(req, res, next) {
    // users can update their own account and admins can update any account
    console.log('req.params'+JSON.stringify(req.params));
    console.log('req.body'+JSON.stringify(req.body));
    

    accountService.update(req.params.Users_id, req.body)
        .then(account => res.json(account))
        .catch(next);
}

function inActive(req, res, next){
    console.log('req.params'+JSON.stringify(req.params));
    accountService.delete(req.params.Users_id)
        .then(account => res.json(account))
        .catch(next);

}



function phonevaidation (req, res, next) {
    const schema = Joi.object({
        PhoneNumber: Joi.string().regex(/^\d+$/).error(() => 'enter valid phone number').max(12).required(),
        CountryID:Joi.number().integer().required(),
        NumberinInterForm:Joi.number().integer().required(),
        PhoneNoTypeID:Joi.number().integer().required(),
         });
    validateRequest(req, next, schema);
}


function addphone(req, res, next) {
    console.log("addphone req.body"+JSON.stringify(req.body));

    accountService.addphone(req.body, req.params.Users_id)
        .then(() => res.json({ message: 'Phone Number Added Successfully' }))
        .catch(next);
}

function emailvalidation (req, res, next) {
    const schema = Joi.object({
        EmailAddress:Joi.string().email().required()
        });
    validateRequest(req, next, schema);
}

function addemail(req, res, next) {
    console.log("addemail req.body"+JSON.stringify(req.body));

    accountService.addemail(req.body, req.params.Users_id)
        .then(() => res.json({ message: 'Email Address Added Successfully' }))
        .catch(next);
}

function addressvalidation(req, res, next) {
        const schema = Joi.object({      
        Address: Joi.string().allow(null, ''),
        Town: Joi.string().allow(null, ''),
        State:Joi.string().allow(null, ''),
        CountryID:Joi.number().integer().required()
        });
    validateRequest(req, next, schema);
}


function addaddress(req, res, next) {
    console.log("addAddress req.body"+JSON.stringify(req.body));

    accountService.addaddress(req.body, req.params.Users_id)
        .then(() => res.json({ message: 'Address Added Successfully' }))
        .catch(next);
}

function _delete(req, res, next) {
    // users can delete their own account and admins can delete any account
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.delete(req.params.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}

// helper functions

function setTokenCookie(res, token) {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}