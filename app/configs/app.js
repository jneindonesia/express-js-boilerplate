const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const routes = require('../routes')

const app = express()

// enable cors
app.use(cors())
app.options('*', cors())

// parse json request body
app.use(express.json())

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }))

// logger
app.use(morgan('dev'))

// routes
app.use('/', routes)

app.all('*', (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Service not found'
  })
})

module.exports = app
