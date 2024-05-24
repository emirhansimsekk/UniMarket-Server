const { Pool } = require('pg')
require("dotenv").config()
const pool = new Pool({
    host: process.env.HOST,
    port: process.env.PORTDB,
    user: process.env.USER,
    password: 'iao%upC3mxS^x;Qy',
    database: 'unimarket'
})
module.exports = pool
