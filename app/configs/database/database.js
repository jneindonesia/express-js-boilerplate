const oracledb = require('oracledb')
const uuid = require('uuid')
const config = require('../config')

process.env.onConnectingDb = true
process.env.onConnectingDb2 = true
const onConnectingDbMsg = 'Sedang menghubungkan, coba beberapa saat lagi'

let aliasCounter = 1

const dbInitialize = async (name = 1) => {
  process.env.onConnectingDb = true

  oracledb.initOracleClient()

  const alias = name.toString()

  const result = await oracledb.createPool({
    poolAlias: alias,
    user: config.database.user,
    password: config.database.password,
    connectString: config.database.connectString,
    poolMin: 10,
    poolMax: 500,
    poolTimeout: 30,
    poolIncrement: 100,
    poolPingInterval: 60
  })

  process.env.onConnectingDb = false
  console.log('db connected')
  return result
}

const handleConnectionError = async (error, connectionName = '1') => {
  const msg = error.message.split(' ')[0]
  console.log(msg)

  if (msg === 'NJS-040:') {
    try {
      const alias = uuid.v4()
      await dbInitialize(alias)
      aliasCounter = alias

      return true
    } catch (err) {
      throw new Error('Terjadi kesalahan. Silahkan coba lagi')
    }
  } else {
    throw error
  }
}

const execute = async (data = { sql: '', bindData: [], getFirst: false }) => {
  if (process.env.onConnectingDb === 'false') {
    try {
      const connection = await oracledb.getConnection(aliasCounter.toString())

      try {
        const hit = await connection.execute(data.sql, data.bindData || [], {
          outFormat: oracledb.OUT_FORMAT_OBJECT
        })

        let result = hit

        if (hit.rows) {
          result = hit.rows
        }

        await connection.commit()
        await connection.close()

        if (data.getFirst) {
          return result[0] || {}
        }

        return result
      } catch (err) {
        connection.commit()
        await connection.close()

        throw new Error(err.message)
      }
    } catch (connectError) {
      await handleConnectionError(connectError, '1')
    }
  } else {
    throw new Error(onConnectingDbMsg)
  }
}

const transaction = async (callback) => {
  if (process.env.onConnectingDb2 === 'false') {
    try {
      const trx = await oracledb.getConnection(aliasCounter.toString())

      try {
        const result = await callback(trx)

        trx.commit()

        await trx.close()

        return result
      } catch (err) {
        trx.rollback()

        await trx.close()

        throw new Error(err.message)
      }
    } catch (connectError) {
      await handleConnectionError(connectError, '2')
    }
  } else {
    throw new Error(onConnectingDbMsg)
  }
}

module.exports = {
  dbInitialize,
  execute,
  transaction
}
