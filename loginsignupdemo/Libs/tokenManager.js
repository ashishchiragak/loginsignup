const Jwt = require('jsonwebtoken'),
    Config = require('../Config'),
    UniversalFunctions = require('../Utils/UniversalFunctions'),
    ERROR = Config.responseMessages.ERROR;

var generateToken = function (tokenData, userType) {
    return new Promise((resolve, reject) => {
        try {
            let secretKey;
            switch (userType) {
                case Config.APP_CONSTANTS.SCOPE.ADMIN:
                    secretKey = Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY_ADMIN;
                    break;
                case Config.APP_CONSTANTS.SCOPE.USER:
                    secretKey = Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY_USER;
                    break;
                default:
                    secretKey = Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY_ADMIN;
            }

            let token = Jwt.sign(tokenData, secretKey);
            return resolve(token);
        } catch (err) {
            return reject(err);
        }
    });
};


var verifyToken = async function verifyToken(tokenData,request) {
    try{
        var user;
        if (tokenData.scope === Config.APP_CONSTANTS.SCOPE.ADMIN) {
            user = await DAO.getData(Models.Admins, {_id: tokenData._id,accessToken:{$in:[request.headers['authorization']]}}, {
                __v: 0,
                password: 0,
                loginTime: 0
            }, {lean: true});
        } else if (tokenData.scope === Config.APP_CONSTANTS.SCOPE.USER){
            user = await DAO.getData(Models.Users, {_id: tokenData._id,'token.accessToken':{$in:[request.headers['authorization']]}},
                {__v: 0}, {lean: true});
        }
        else {
            return ERROR.UNAUTHORIZED;
        }
        if (user.length === 0) {
            return ERROR.UNAUTHORIZED;
        }
        else if (user && user[0] && user[0].isDeleted == true){
            return ERROR.UNAUTHORIZED;
        }
        else if (user && user[0] && user[0].isBlocked == true){
            return ERROR.UNAUTHORIZED;
        }
        else if (user && user[0]) {
            user[0].scope = tokenData.scope;
            return {
                isValid: true,
                credentials: user[0]
            };
        } else return ERROR.UNAUTHORIZED;
    }catch (e) {
        console.log(e,'eeeeeeeeeeeeeeee');
        throw e;
    }
};

module.exports = {
    generateToken: generateToken,
    verifyToken: verifyToken
};