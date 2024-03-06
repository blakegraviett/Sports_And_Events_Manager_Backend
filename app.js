// * IMPORTS * //
require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
// Functions
const connectToDB = require('./lib/mongoose')
const notFoundHandler = require('./middleware/404.middleware')

// * SECURITY * //
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')

// * MIDDLEWARE * //
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))
app.use(helmet())
app.use(cors())
app.use(xss())

// * ROUTES * //
// Auth Router
app.use('/api/v1/auth', require('./routes/auth.routes'))

// Events Router
app.use('/api/v1/events', require('./routes/event.routes'))

// Users Router
app.use('/api/v1/users', require('./routes/user.routes'))

// Organizations Router
app.use('/api/v1/orgs', require('./routes/org.routes'))

// Teams Router
app.use('/api/v1/teams', require('./routes/team.routes'))

// 404 Handler
app.use(notFoundHandler)

// * Server * //
async function startServer() {
  try {
    // Connect to database
    connectToDB(process.env.MONGO_DB_URI)

    // Listen to server
    app.listen(process.env.PORT, () => {
      console.log(`Server is listening at ${process.env.SERVER_URL}`)
    })
  } catch (error) {
    console.log(error)
  }
}

// * RUN SERVER * //
startServer()
