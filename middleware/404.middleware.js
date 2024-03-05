// * 404 * //
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Page Not found',
  })
  next()
}

// * EXPORTS * //
module.exports = notFoundHandler
