let Controller = require('../Controllers');
let UniversalFunctions = require('../Utils/UniversalFunctions');
let Joi = require('joi');
let Config = require('../Config');
let SUCCESS = Config.responseMessages.SUCCESS;
let ERROR = Config.responseMessages.ERROR;

module.exports = [
    {
        method: 'POST',
        path: '/user/loginUser',
        config: {
            description: 'loginUser',
            auth:false,
            tags: ['api', 'user'],
            handler: async (request, reply) => {
                try {
                    let response = await Controller.userController.loginUser(request.payload);
                    return await UniversalFunctions.sendSuccess("en", SUCCESS.DEFAULT, response, reply);
                } catch(error) {
                    error['message'] = ((error || {}).message || {}).en || (error || {}).message;
                    return reply.response(error).code(error.statusCode);
                }
            },
            validate: {
                payload: {
                    email: Joi.string().required().lowercase().email().trim().label('email'),
                    deviceToken: Joi.string().description('device token for receiving notification'),
                    deviceType: Joi.string().description('device type for receiving notification').valid(['IOS','ANDROID','WEB']),
                    password: Joi.string().description('password'),
                },
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/user/registerUser',
        config: {
            description: 'registerUser',
            auth:false,
            tags: ['api', 'user'],
            handler: async (request, reply) => {
                try {
                    let response = await Controller.userController.registerUser(request.payload);
                    return await UniversalFunctions.sendSuccess("en", SUCCESS.DEFAULT, response, reply);
                } catch(error) {
                    console.log(error,'eeeeeeeeeeeeeeeeeeeeee')
                    error['message'] = ((error || {}).message || {}).en || (error || {}).message;
                    return reply.response(error).code(error.statusCode);
                }
            },
            validate: {
                payload: {
                    email: Joi.string().email().lowercase().trim().label('Email').required(),
                    deviceToken: Joi.string().description('device token for receiving notification'),
                    password:Joi.string().required().description('password not required in case of social signup'),
                    firstName: Joi.string().required().trim(),
                    lastName: Joi.string().required().trim(),
                },
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/user/getProfile',
        config: {
            description: 'getProfile',
            // auth:false,
            auth: {
                strategies:[Config.APP_CONSTANTS.SCOPE.USER],
                mode: 'required'
            },
            tags: ['api', 'user'],
            handler: async (request, reply) => {
                try {
                    let userData = request.auth.credentials;
                    let response = await Controller.userController.getProfile(request,userData);
                    return await UniversalFunctions.sendSuccess("en", SUCCESS.DEFAULT, response, reply);
                } catch(error) {
                    console.log(error,'eeeeeeeeee');
                    error['message'] = ((error || {}).message || {}).en || (error || {}).message;
                    return reply.response(error).code(error.statusCode);
                }
            },
            validate: {
                failAction: UniversalFunctions.failActionFunction,
                headers: UniversalFunctions.authorizationHeaderObj
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/user/verifyEmail',
        config: {
            description: 'verifyEmailUser',
            auth:false,
            tags: ['api', 'user'],
            handler: async (request, reply) => {
                try {
                    let response = await Controller.userController.verifyEmail(request.query);
                    return reply.view(response.fileName);
                } catch(error) {
                    console.log(error,'errorrrrrrrr')
                    error['message'] = ((error || {}).message || {}).en || (error || {}).message;
                    return reply.response(error).code(error.statusCode);
                }
            },
            validate: {
                query: {
                    verifyEmailToken: Joi.string().required().description('verifyEmailToken received on email'),
                },
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        }
    },
];