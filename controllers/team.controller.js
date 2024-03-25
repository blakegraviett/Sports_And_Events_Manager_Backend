// * IMPORTS * //
const Team = require('../models/team.model')
const { successfulRes, unsuccessfulRes } = require('../lib/response')
const cloudinary = require('cloudinary').v2
const fs = require('fs')

// * CONTROLLERS * //
// get all teams based on organization
const getAllTeams = async (req, res) => {
  // get organization from the user
  const { org } = req.user

  // get all teams based on organization
  const teams = await Team.find({ org: org })

  // if no teams, return error
  if (!teams) {
    return unsuccessfulRes({ res })
  }

  // send back all teams
  return successfulRes({ res, data: teams })
}

// get single team based on id
const getSingleTeam = async (req, res) => {
  // get id from the request params
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
  }

  // find team by id
  const team = await Team.findById(id)

  // if no team, return error
  if (!team) {
    return unsuccessfulRes({ res })
  }

  // return team
  return successfulRes({ res, data: team })
}

// create new team
const createTeam = async (req, res) => {
  // get data from the request body
  const { name, logo } = req.body

  // get the org and the author from the user
  const { org, userId } = req.user

  // create new team
  const newTeam = await Team.create({
    name,
    logo,
    org,
    author: userId,
  })

  // return new team
  return successfulRes({ res, data: newTeam })
}

// update team by organization
const updateTeam = async (req, res) => {
  // get id from the request params
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
  }

  // get content from the request body
  const { name, logo } = req.body

  // update the team
  const updatedTeam = await Team.findByIdAndUpdate(
    id,
    {
      name,
      logo,
    },
    { new: true }
  )

  // return updated team
  return successfulRes({ res, data: updatedTeam })
}

//delete team by id
const deleteSingleTeam = async (req, res) => {
  // get id from the request params
  const { id } = req.params

  // if no id, return error
  if (!id) {
    return unsuccessfulRes({ res })
  }

  // find team by id
  const deletedTeam = await Team.findByIdAndDelete(id)

  // return deleted team
  return successfulRes({ res, data: { msg: 'Successfully delted team' } })
}

// Upload team logo
const uploadSingleImageToCloudinary = async (req, res) => {
  const result = await cloudinary.uploader.upload(req.files.img.tempFilePath, {
    use_filename: true,
    folder: 'team_logos',
  })

  fs.unlinkSync(req.files.img.tempFilePath)

  // send success message
  successfulRes({ res, data: { src: result.secure_url } })
}

// * EXPORTS * //
module.exports = {
  getAllTeams,
  getSingleTeam,
  createTeam,
  updateTeam,
  deleteSingleTeam,
  uploadSingleImageToCloudinary,
}
