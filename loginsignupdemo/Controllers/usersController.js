const Config = require('../Config'),
    TokenManager = require('../Libs/tokenManager'),
    UniversalFunctions = require('../Utils/UniversalFunctions'),
    ERROR = Config.responseMessages.ERROR;

let loginUser = async (payload) => {
    try {
        let criteria ={isDeleted:false, email:payload.email};
        let user = await DAO.getDataOne(Models.Users,criteria,{},{lean:true});
        if(!user) throw ERROR.USER_NOT_FOUND;
        if (user.isBlocked) throw ERROR.BLOCK_USER;
        if (!(user.isEmailVerified)) throw ERROR.EMAIL_NOT_VERIFIED;
        let checkPassword = await UniversalFunctions.decryptPswrd(payload.password, user.password); //compare password string to encrypted string
        if (checkPassword == false) throw ERROR.WRONG_PASSWORD;

        let tokenData = {
            scope: Config.APP_CONSTANTS.SCOPE.USER,
            _id: user._id,
            time: (new Date()).getTime(),
            isRunner:user.isRunner,
            isRequester:user.isRequester,
            documentsUploaded:user.documentsUploaded,
            isRunnerApproved:user.isRunnerApproved
        };
        let accessToken = await TokenManager.generateToken(tokenData, Config.APP_CONSTANTS.SCOPE.USER); // after successful login generate the Auth token for admin to access API's
        await DAO.findAndUpdate(Models.Users, {_id: user._id}, {$set: {tokenTime: tokenData.time,accountDeactivated:false},$addToSet:{token:{deviceType:payload.deviceType,deviceToken:payload.deviceToken,accessToken:accessToken}}},{});
        await DAO.findAndUpdate(Models.Users, {_id: {$ne:user._id},deviceToken:payload.deviceToken}, {$pull:{deviceToken:payload.deviceToken}});
        delete user.password;
        delete user.accessToken;
        delete user.deviceToken;
        return {userData:user,accessToken:accessToken};
    }catch (e) {
        console.log(e,'eeeeeeee');
        throw e;
    }
};
let registerUser = async (payload) => {
    try{
        let criteria = {
            isDeleted: false,
            isBlocked: false,
            email:payload.email
        };
        let getUser = await DAO.count(Models.Users,criteria);
        if(getUser){
            throw ERROR.USER_ALREADY_EXISTS
        }else {
            // password
            let password = await UniversalFunctions.encryptPswrd(payload.password.toString());
            //email verification token generation
            let tokenData = {
                scope: Config.APP_CONSTANTS.SCOPE.USER,
                _id: Math.random(),
                time: (new Date()).getTime()
            };
            let verifyEmailToken = await TokenManager.generateToken(tokenData, Config.APP_CONSTANTS.SCOPE.USER); // after successful login generate the Auth token for admin to access API's
            criteria = {...criteria,firstName:payload.firstName,lastName:payload.lastName,password:password,verifyEmailToken:verifyEmailToken};
            await DAO.saveData(Models.Users,criteria);
            // send the link to user email
            let link=Config.APP_CONSTANTS.LINKS.VERIFY_EMAIL+verifyEmailToken;
            return {link}
        }
    }catch (e) {
        console.log(e,'eeeeee error while signup');
        throw e;
    }
};

let getProfile = async (request,userData) => {
    try {
        let profile = await DAO.getDataOne(Models.Users,{_id:userData._id},{token:0,password:0,__v:0},{lean:true});
        profile = {...profile,accessToken:request.headers['authorization']};
        return {profile}
    }catch (e) {
        console.log(e,'eeeeeeeee');
        throw e;
    }
};
let verifyEmail = async (payload) => {
    try {
        let verify = await DAO.findAndUpdate(Models.Users,{
            verifyEmailToken:payload.verifyEmailToken,
        },{$set:{isEmailVerified:true},$unset:{verifyEmailToken:1}},{});
        if(verify){
            return {verify:true,fileName:'verifyEmail'}
        }else{
            return {verify:false,fileName:'userNotFound'}
        }
    }catch (e) {
        console.log(e,'eeeeeeeeeeee');
        throw e;
    }
};

module.exports = {
    loginUser:loginUser,
    registerUser:registerUser,
    getProfile:getProfile,
    verifyEmail:verifyEmail
};