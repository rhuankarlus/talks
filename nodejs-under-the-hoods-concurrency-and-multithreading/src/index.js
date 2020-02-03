const app = require('express')();
const routes = require('./routes');

// process.env.UV_THREADPOOL_SIZE = 10;

app
    .use(routes)
    .listen(3000, () => console.log('server up'));

module.exports = app;
