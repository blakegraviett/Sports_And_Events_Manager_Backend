// * IMPORTS * //
const Org = require('../models/org.model')
const { successfulRes, unsuccessfulRes } = require('../lib/response')

// * CONTROLLERS * //
// get all orgs
const getAllOrgs = async (req, res) => {
  // get all orgs
  const orgs = await Org.find()

  // if no orgs, return
  if (!orgs) {
    return unsuccessfulRes({ res })
  }

  // send back all orgs
  successfulRes({ res, data: orgs })
}

// get single org by id
const getSingleOrg = async (req, res) => {
  // get id from the request params
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
  }

  // find org by id
  const org = await Org.findById(id)

  // if no org, return error
  if (!org) {
    return unsuccessfulRes({ res, status: 404, msg: 'Org not found' })
  }

  // send back org
  successfulRes({ res, data: org })
}

// * EXPORTS * //
module.exports = {
  getAllOrgs,
  getSingleOrg,
}
