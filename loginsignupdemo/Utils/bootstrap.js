'use strict';

let Config = require('../Config'),
    bcrypt = require('bcryptjs');

Mongoose.Promise = Promise;
const util = require('util');
const fs = require('fs');
let URI = (((Config || {})[process.env.NODE_ENV] || {}).mongoDb || {}).URI || `mongodb://localhost:27017/test`;

//Connect to MongoDB
Mongoose.connect(URI, {useNewUrlParser:true,useUnifiedTopology:true}).then(success => {
    // run();
}).catch(err => {
    console.log({ERROR: err});
    process.exit(1);
});



async function run() {

    /*-------------------------------------------------------------------------------
     * add admin
     * -----------------------------------------------------------------------------*/
  let password =   "admin@123";
  password = await bcrypt.hash(password, 10);
    
    let adminDetails = {
        firstName : "Admin",
        email: "admin@cb.com",
        password: password
    };
    
    try{
        
        const promise = [
            createAdmin(adminDetails),
            checkFolderAlreadyExist()
        ];

        
        await Promise.all(promise);
    }
    catch(err){
        console.log("info",{ERROR: err})
    }
}

function createAdmin(adminDetails) {
    return new Promise((resolve, reject) => {
        try {
          
            DAO.findAndUpdate(Models.Admins,{email:adminDetails.email}, adminDetails, { lean: true, upsert: true, new : true});

            return resolve("Admin Added");
        } catch (err) {
            
            return reject(err);
        }
    });
}
function checkFolderAlreadyExist() {

    let _dirPath = "./uploads";
    if (!fs.existsSync(_dirPath)) {
        const mkdir = util.promisify(fs.mkdir);
        mkdir(_dirPath).then((stats) => {
            console.log('folder created successfully ');
        }).catch((error) => {
            console.log(error);
        });
    } else {
        console.log('folder already exist ');
    }
}


module.exports = {
    run:run
}