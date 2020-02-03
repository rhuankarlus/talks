const router = require('express').Router();

const processId = process.pid;
router.get('/', (req, res) => {
    res.jsonp({
        processId,
        message: 'still alive',
    });
});

module.exports = router;
