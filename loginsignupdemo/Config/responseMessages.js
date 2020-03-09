let SUCCESS = {
    DEFAULT:{
        statusCode: 200,
        message: {
            en: "Created Successfully",
            ar: "تم الإنشاء بنجاح"
        },
        type: 'DEFAULT_SUCCESS'
    }
};

let ERROR = {
    DEFAULT:{
        statusCode: 400,
        message: {
            en: "Server Error Something Went Wrong",
            ar: "خطأ في الخادم حدث خطأ"
        },
        type: 'SOMETHING_WENT_WRONG'
    },
    USER_ALREADY_EXISTS:{
        statusCode: 400,
        message: {
            en: "User with same email already exists",
            ar: "خطأ في الخادم حدث خطأ"
        },
        type: 'USER_ALREADY_EXISTS'
    },
    USER_NOT_FOUND:{
        statusCode: 400,
        message: {
            en: "User with given credentials doesn't exists",
            ar: "خطأ في الخادم حدث خطأ"
        },
        type: 'USER_NOT_FOUND'
    },
    BLOCK_USER:{
        statusCode: 400,
        message: {
            en: "Please contact admin your account has been temporarily blocked.",
            ar: "خطأ في الخادم حدث خطأ"
        },
        type: 'USER_NOT_FOUND'
    },
    WRONG_PASSWORD:{
        statusCode:400,
        message:{
            en:'You have entered Wrong Password'
        },
        type:'WRONG_PASSWORD'
    },
    EMAIL_NOT_VERIFIED:{
        statusCode:400,
        message:{
            en:'Verify your email first to login.'
        },
        type:'EMAIL_NOT_VERIFIED'
    }
};

module.exports = {
    SUCCESS:SUCCESS,
    ERROR:ERROR,
};