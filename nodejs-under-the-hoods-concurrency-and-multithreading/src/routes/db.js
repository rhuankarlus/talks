const router = require('express').Router();
const groupBy = require('lodash').groupBy;
const uniqBy = require('lodash').uniqBy;
const partition = require('lodash').partition;

const processId = process.pid;

const APOSENTADO = '[APOSENTADO]';
const getStatus = (age) => age >= 65 ? APOSENTADO : `${65 - age} anos para se aposentar`;

router.get('/users', (req, response) => {
    const init = Date.now();
    req.pool.connect().then((client) => {
        client.query('SELECT * FROM users', (err, res) => {
            const trabalhadores = {};
            const departamentos = groupBy(
                res.rows.filter(user => user.age >= 18),
                'department',
            );
            for(let i; i < 10000000; i++) {}
            Object
                .keys(departamentos)
                .forEach(departmento => {
                    const [aposentados, naoAposentados] = partition(
                        uniqBy(departamentos[departmento], user => user.forename),
                        ({ age }) => getStatus(age) === APOSENTADO
                    );

                    trabalhadores[departmento] = {
                        aposentados,
                        naoAposentados,
                    };
                });
            client.release();
            response.jsonp({
                processId,
                trabalhadores,
                timeInSeconds: (Date.now() - init) / 1000,
            });
        });
    })
});

router.get('/users_not_map', (req, response) => {
    const init = Date.now();
    req.pool.connect().then(pg_client => {
        pg_client.query('SELECT * FROM users', (err, res) => {
            pg_client.release();
            response.jsonp({
                processId,
                rows: res.rowCount,
                timeInSeconds: (Date.now() - init) / 1000,
            });
        });
    })
});

module.exports = router;
