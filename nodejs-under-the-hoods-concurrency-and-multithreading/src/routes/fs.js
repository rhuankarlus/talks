const router = require('express').Router();
const fs = require('fs');
const processId = process.pid;

router.get('/read_file', (req, res) => {
    fs.readFile(__filename, (err, content) => res.jsonp({
        content: content.toString(),
        processId,
    }));
});

module.exports = router;
