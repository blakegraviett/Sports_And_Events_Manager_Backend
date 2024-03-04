// * IMPORTS * //
const mongoose = require('mongoose')

// * CONNECT TO DATABASE * //
function connectToDB(uri) {
  // Connect to database
  const connection = mongoose.connect(uri)

  // Confirm connection
  if (connection) {
    console.log('Connected to database')
  }
  return connection
}

// * EXPORTS * //
module.exports = connectToDB
