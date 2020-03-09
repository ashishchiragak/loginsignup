const Joi = require('joi'),
    bcrypt = require('bcryptjs'),
    saltRounds = 10,
    Boom = require('boom'),
    Config = require('../Config'),
    ERROR = Config.responseMessages.ERROR,
    SUCCESS = Config.responseMessages.SUCCESS;

const sendError = async (language, data, reply) => {
    try {
        let error;
        if (typeof data == 'object' && data.hasOwnProperty('statusCode') && data.hasOwnProperty('message')) {
            let finalMessage = data.message.en;
            if (language && language == "AR" && data.message.ar != undefined) finalMessage = data.message.ar;
            if (data.message.ar == undefined) { finalMessage = data.message.en }
            error = { statusCode: data.statusCode, message: finalMessage };
            if (data.hasOwnProperty('type')) {
                winston.error(error);
                throw error;
            }
        }
        else {
            let errorToSend = '',
                type = '';

            if (typeof data == 'object') {
                if (data.name == 'MongoError') {
                    if (language && language == "AR") errorToSend += ERROR.DB_ERROR.message.ar;
                    else errorToSend += ERROR.DB_ERROR.message.en;

                    type = ERROR.DB_ERROR.type;
                    if (data.code = 11000) {

                        if (language && language == "AR") errorToSend += ERROR.DUPLICATE.message.ar;
                        else errorToSend += ERROR.DUPLICATE.message.en;

                        type = ERROR.DUPLICATE.type;
                    }
                } else if (data.name == 'ApplicationError') {

                    if (language && language == "AR") errorToSend += ERROR.APP_ERROR.message.ar;
                    else errorToSend += ERROR.APP_ERROR.message.en;

                    type = ERROR.APP_ERROR.type;
                } else if (data.name == 'ValidationError') {

                    if (language && language == "AR") errorToSend += ERROR.APP_ERROR.message.ar + data.message;
                    else errorToSend += ERROR.APP_ERROR.message.en + data.message;

                    type = ERROR.APP_ERROR.type;
                } else if (data.name == 'CastError') {

                    if (language && language == "AR") errorToSend += ERROR.DB_ERROR.message.ar + ERROR.INVALID_OBJECT_ID.message.ar;
                    else errorToSend += ERROR.DB_ERROR.message.en + ERROR.INVALID_OBJECT_ID.message.en;

                    type = ERROR.INVALID_OBJECT_ID.type;
                } else if (data.response) {
                    errorToSend = data.response.message;
                }
                else {
                    errorToSend = data
                    errorToSend = "Something went wrong, please try again. If the problem persist please contact administrator";
                    logError = data;
                }
            } else {
                errorToSend = data;
                type = ERROR.DEFAULT.type;
            }
            let customErrorMessage = errorToSend;
            if (typeof errorToSend == 'string') {
                if (errorToSend.indexOf("[") > -1) {
                    customErrorMessage = errorToSend.substr(errorToSend.indexOf("["));
                } else {
                    customErrorMessage = errorToSend;
                }
                customErrorMessage = customErrorMessage.replace(/"/g, '');
                customErrorMessage = customErrorMessage.replace('[', '');
                customErrorMessage = customErrorMessage.replace(']', '');
            }
            error =  Boom.create(400,customErrorMessage);
            error.output.payload.type = type;
            error.loggingMessage = logError;
            winston.error(error);
            return error;
        }
    } catch (error) {
        return error;
    }
};

const sendSuccess = (language, successMsg, data, reply) => {
    console.log(SUCCESS.DEFAULT,successMsg,'successssssssssss')
    successMsg = successMsg || SUCCESS.DEFAULT.message.en;
    if (typeof successMsg == 'object' && successMsg.hasOwnProperty('statusCode') && successMsg.hasOwnProperty('message')) {
        let finalMessage = successMsg.message.en;
        if (language && language == "AR" && successMsg.message.ar != undefined) finalMessage = successMsg.message.ar;
        if (successMsg.message.ar == undefined) { finalMessage = successMsg.message.en }
        if (successMsg.type == 'LOGIN_SUCCESS') {
            if (data.firstName != undefined) {
                finalMessage += ' ' + data.firstName
            }
        }
        return { statusCode: successMsg.statusCode, message: finalMessage, data: data || {} };
    }
    else return { statusCode: 200, message: successMsg, data: data || {} };
};

const failActionFunction = (request, reply, error) => {
    winston.info("==============request===================", request.payload, request.query, error)
    error.output.payload.type = "Joi Error";
    if (error.isBoom) {
        delete error.output.payload.validation;
        if (error.output.payload.message.indexOf("authorization") !== -1) {
            error.output.statusCode = ERROR.UNAUTHORIZED.statusCode;
            return reply(error);
        }
        let details = error.details[0];
        if (details.message.indexOf("pattern") > -1 && details.message.indexOf("required") > -1 && details.message.indexOf("fails") > -1) {
            error.output.payload.message = "Invalid " + details.path;
            return reply(error);
        }
    }
    let customErrorMessage = '';
    if (error.output.payload.message.indexOf("[") > -1) {
        customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
    } else {
        customErrorMessage = error.output.payload.message;
    }
    customErrorMessage = customErrorMessage.replace(/"/g, '');
    customErrorMessage = customErrorMessage.replace('[', '');
    customErrorMessage = customErrorMessage.replace(']', '');
    error.output.payload.message = customErrorMessage.replace(/\b./g, (a) => a.toUpperCase());
    delete error.output.payload.validation;
    return error;
};

let authorizationHeaderObj = Joi.object({
    authorization: Joi.string().required()
}).unknown();

/**
 * incrypt password in case user login implementation
 * @param {*} userPassword
 * @param {*} cb
 */
let encryptPswrd = (userPassword) => {
    let salt = bcrypt.genSaltSync(saltRounds);
    let encryptedPassword = bcrypt.hashSync(userPassword, salt);
    return encryptedPassword;
};

/**
 * @param {** decrypt password in case user login implementation} payloadPassword
 * @param {*} userPassword
 * @param {*} cb
 */
let decryptPswrd = async (payloadPassword, userPassword) => {
    return await bcrypt.compare((payloadPassword || ""), (userPassword || ""));
};

module.exports = {
    sendError:sendError,
    sendSuccess:sendSuccess,
    failActionFunction:failActionFunction,
    authorizationHeaderObj:authorizationHeaderObj,
    encryptPswrd:encryptPswrd,
    decryptPswrd:decryptPswrd
};