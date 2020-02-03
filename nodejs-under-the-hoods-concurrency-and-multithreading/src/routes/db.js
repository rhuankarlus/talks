const router = require('express').Router();
const { Client } = require('pg');
const groupBy = require('lodash').groupBy;
const uniqBy = require('lodash').uniqBy;
const partition = require('lodash').partition;

const processId = process.pid;
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});
client.connect();

const APOSENTADO = '[APOSENTADO]';
const getStatus = (age) => age >= 65 ? APOSENTADO : `${65 - age} anos para se aposentar`;

router.get('/users', (req, response) => {
    const init = Date.now();
    client.query('SELECT * FROM users', (err, res) => {
        const trabalhadores = {};
        const departamentos = groupBy(
            res.rows.filter(user => user.age >= 18),
            'department',
        );

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

        response.jsonp({
            processId,
            trabalhadores,
            timeInSeconds: (Date.now() - init) / 1000,
        });
    });
});

module.exports = router;
