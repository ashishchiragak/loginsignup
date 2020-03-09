let SERVER = {
    JWT_SECRET_KEY_USER:'@#$123%',
    JWT_SECRET_KEY_ADMIN:'@#$124%',
};

let SCOPE = {
    USER:'USER',
    ADMIN:'ADMIN',
};

let LINKS = {
    VERIFY_EMAIL: 'http://localhost:8000/user/verifyEmail?verifyEmailToken=',
    FORGOT_PASSWORD: 'http://localhost:8000/forget-password/',
};

module.exports = {
    SERVER:SERVER,
    SCOPE:SCOPE,
    LINKS:LINKS
};