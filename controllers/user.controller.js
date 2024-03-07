// * IMPORTS * //
const User = require('../models/user.model')
const { successfulRes, unsuccessfulRes } = require('../lib/response')

// * CONTROLLERS * //
//get all users by org
const getAllUsersByOrg = async (req, res) => {
  // get organization from the user
  const { org } = req.user

  // get all teams based on organization
  const foundUser = await User.find({ org: org })

  // if no users, return error
  if (!foundUser) {
    return unsuccessfulRes({ res, msg: 'No users found' })
  }

  // default to empty array
  let user = []

  // Looping through the array to get only needed properties
  for (let i = 0; i < foundUser.length; i++) {
    // Accessing the properties of each object
    let currentObject = foundUser[i]
    let name = currentObject.name
    let email = currentObject.email
    let id = currentObject._id

    // Printing or using the properties
    user.push({ name, email, id })
  }

  // return all users
  return successfulRes({
    res,
    data: {
      users: user,
    },
  })
}

// get single user by id
const getSingleUser = async (req, res) => {
  // get id from the request params
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
  }

  // find user by id
  const user = await User.findById(id)

  // if no user, return error
  if (!user) {
    return unsuccessfulRes({ res, msg: 'No user found' })
  }

  // return user
  return successfulRes({
    res,
    data: {
      name: user.name,
      email: user.email,
      id: user._id,
    },
  })
}

// * EXPORTS * //
module.exports = {
  getAllUsersByOrg,
  getSingleUser,
}
