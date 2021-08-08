import Database from 'better-sqlite3'
let databaseName: string = process.env.DATABASE_NAME as string

export default new Database(databaseName, {
    verbose: console.log,
})
