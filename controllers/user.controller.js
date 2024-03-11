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
    let role = currentObject.role
    let org = currentObject.org

    // Printing or using the properties
    user.push({ name, email, id, role, org })
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
      role: user.role,
    },
  })
}

// make a user an admin
const updateUserAdmin = async (req, res) => {
  // get the organization from the admin
  const { org } = req.user

  // get the id from the request params
  const { id } = req.params

  // find the user by id
  const foundUser = await User.findById(id)

  // check to see if the user exists
  if (!foundUser) {
    return unsuccessfulRes({ res, msg: 'No user found' })
  }

  // check to see if the user belongs to the organization
  if (foundUser.org != org) {
    return unsuccessfulRes({ res, msg: 'User not in your organization' })
  }

  // if the user is already an admin, return error
  if (foundUser.role === 'admin') {
    return unsuccessfulRes({ res, msg: 'User is already an admin' })
  }

  // if the user is not an admin, make them an admin
  foundUser.role = 'admin'
  await foundUser.save()

  // return success
  return successfulRes({ res, msg: 'User is now an admin' })
}

// demote a user from admin
const demoteUserAdmin = async (req, res) => {
  // get the organization from the admin
  const { org } = req.user

  // get the id from the request params
  const { id } = req.params

  // find the user by id
  const foundUser = await User.findById(id)

  // check to see if the user exists
  if (!foundUser) {
    return unsuccessfulRes({ res, msg: 'No user found' })
  }

  // check to see if the user belongs to the organization
  if (foundUser.org != org) {
    return unsuccessfulRes({ res, msg: 'User not in your organization' })
  }

  // if the user is not an admin, return error
  if (foundUser.role !== 'admin') {
    return unsuccessfulRes({ res, msg: 'User is not an admin' })
  }

  // if the user is already an admin, demote them from admin
  foundUser.role = 'user'
  await foundUser.save()

  // return success
  return successfulRes({ res, msg: 'User is no longer an admin' })
}
// * EXPORTS * //
module.exports = {
  getAllUsersByOrg,
  getSingleUser,
  updateUserAdmin,
  demoteUserAdmin,
}
