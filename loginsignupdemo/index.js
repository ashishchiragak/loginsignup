if (process.env.NODE_ENV !== 'local' && process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'testing'
    && process.env.NODE_ENV !== 'client') {
    console.log(
        `Please specify one of the following environments to run your server
            - development
            - production

    Example :NODE_ENV=development pm2 start server.js --log-date-format 'DD-MM HH:mm:ss.SSS' --name="dev" -i 2`
    );

    process.env.NODE_ENV = 'development'
}

if (process.env.NODE_ENV == "client") {
    console.log = function () { };
}

global.Mongoose     = require('mongoose');
global.ObjectId     = Mongoose.Types.ObjectId;
global.Models       = require('./Models/');
global.DAO          = require('./DAOManager').queries;

const Hapi          = require('hapi');
const Handlebars    = require('handlebars');

bootstrap = require('./Utils/bootstrap');
Plugins = require('./Plugins');

// Create Server
let server = new Hapi.Server({
    app: {
        name: 'loginSignUpDemo'
    },
    port: 8000,
    routes: {
        cors: true
    }
});

// hapi swagger workaround
// server.ext('onRequest', async (request, h) => {
//     request.headers['x-forwarded-host'] = (request.headers['x-forwarded-host'] || request.info.host);
//     return h.continue;
// });

process.on('uncaughtException',(err)=>{
    console.log("==============uncaughtException=================",err)
});


process.on('unhandledRejection',(err)=>{
    console.log("==============unhandledRejection=================",err)
});

server.events.on('response', request => {
    console.log("info",`[${request.method.toUpperCase()} ${request.url.pathname} ]`);
    console.log('info',`[${request.method.toUpperCase()} ${request.url.pathname} ](${request.response.statusCode || "error null status code"}) : ${request.info.responded-request.info.received} ms`);
});

(async initServer => {
    // require routes
    let Routes          = require('./Routes');

    // Register All Plugins
    await server.register(Plugins);
    // configure template support
    server.views({
        engines: {
            html: Handlebars
        },
        path: __dirname + '/views',
        // layout: 'indexx'
    });
    // API Routes
    try { await server.route(Routes); } catch (e) { console.log(e, 'eeeeeeeeeeee') }


    // Default Routes
    server.route(
        [
            {
                method: 'GET',
                path: '/',
                handler: (request, reply) => "Welcome",
                config: {
                    auth: false
                }
            }]
    );

    // // hapi swagger workaround
    // server.ext('onRequest', async (request, h) => {
    //     request.headers['x-forwarded-host'] = (request.headers['x-forwarded-host'] || request.info.host);
    //     return h.continue;
    // });
    //
    // process.on('uncaughtException', (err) => {
    //     console.log("==============uncaughtException=================", err)
    // });
    //
    //
    // process.on('unhandledRejection', (err) => {
    //     console.log("==============unhandledRejection=================", err)
    // });

    // Start Server
    try {
        await server.start();
        // in case of running the node server in cluster mode it will only run the scheduler for the first node so we can access

        if ((process.env.NODE_APP_INSTANCE == "0" || process.env.NODE_APP_INSTANCE == undefined)) {
            bootstrap.run()
        }

        console.log("info", `Server running at ${server.info.uri}`);
    } catch (error) {
        console.log("info", error);
    }
})();