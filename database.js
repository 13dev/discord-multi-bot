const Database = require('better-sqlite3')
module.exports = new Database(process.env.DATABASE_NAME, {
    verbose: console.log,
})
