'use strict';

const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('@koa/router');
const body = require('koa-body');
const serve = require('koa-static');
const User = require('./user');
const Content = require('./Content')
const packageJson = require('./package.json');

// Create express instance
const app = new Koa();
const router = new Router();

const handler = async (ctx, next) => {
    try {
        await next();
        if (ctx.body?.data.message) {
            ctx.body.message = ctx.body.data.message;
            ctx.body.data.message = undefined;
        }
    } catch (err) {
        console.log(err);
        ctx.status = 200;
        ctx.body = {
            code: err.status || err.statusCode || 500, message: err.message,
        };
    }
};

app.use(serve('static'));
app.use(cors());
app.use(handler);
app.use(router.routes()).use(router.allowedMethods());

router.get('/api/status', (ctx) => {
    ctx.body = {
        code: 200, data: {
            version: packageJson.version,
        }, message: 'Ninja is already.',
    };
});

router.get('/api/info', async (ctx) => {
    const data = await User.getPoolInfo();
    ctx.body = {data};
});

router.post('/api/login', body(), async (ctx) => {
    const body = ctx.request.body;
    const user = new User(body);
    const data = await user.login();
    ctx.body = {data};
});

router.post('/api/register', body(), async (ctx) => {
    const body = ctx.request.body;
    const user = new User(body);
    const data = await user.register();
    ctx.body = {data};
});

router.get('/api/userinfo', async (ctx) => {
    const query = ctx.query;
    const eid = query.eid;
    const user = new User({eid});
    const data = await user.getUserInfoByEid();
    ctx.body = {data};
});


router.post('/api/delaccount', body(), async (ctx) => {
    const body = ctx.request.body;
    const eid = body.eid;
    const user = new User({eid});
    const data = await user.delUserByEid();
    ctx.body = {data};
});

router.post('/api/update', body(), async (ctx) => {
    const body = ctx.request.body;
    const eid = body.eid;
    const username = body.username;
    const ck = body.ck;
    const user = new User({eid, ck, username});
    const data = await user.update();
    ctx.body = {data};
});

router.post('/api/disable', body(), async (ctx) => {
    const body = ctx.request.body;
    const eid = body.eid;
    const user = new User({eid});
    const data = await user.disableEnv();
    ctx.body = {data};
});


router.post('/api/enable', body(), async (ctx) => {
    const body = ctx.request.body;
    const eid = body.eid;
    const user = new User({eid});
    const data = await user.enableEnv();
    ctx.body = {data};
});

router.post('/api/verifyToken', body(), async (ctx) => {
    const body = ctx.request.body;
    const token = body.token;
    const user = new User({token});
    const data = await user.verifyToken();
    ctx.body = {data};
});


router.get('/api/getContent', async (ctx) => {
    const query = ctx.query;
    const fileName = query.contentName;
    const content = new Content({fileName});
    const data = await content.readFile();
    ctx.body = {data};
});


router.post('/api/setContent', body(), async (ctx) => {
    const body = ctx.request.body;
    const fileName = body.contentName;
    const fileContent = body.content;
    const content = new Content({fileName,fileContent});
    const data = await content.writFile();
    ctx.body = {data};
});



const port = process.env.NINJA_PORT || 5701;
console.log('Start Ninja success! listening port: ' + port);
app.listen(port);
