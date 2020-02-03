const app = require('express')();
const {
    workers,
    cpp,
    db,
    dummy,
    jsProcessing,
} = require('./routes');

// process.env.UV_THREADPOOL_SIZE = 10;

app
    .use(workers)
    .use(cpp)
    .use(db)
    .use(dummy)
    .use(jsProcessing)
    .listen(3000, () => console.log('server up'));

module.exports = app;
