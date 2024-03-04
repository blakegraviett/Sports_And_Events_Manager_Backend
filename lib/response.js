// * Responses * //
// SUCCCESS RESPONSE
function successfulRes({ res, status = 200, data = {} }) {
  return res.status(status).json({
    success: true,
    data,
  })
}

// ERROR RESPONSE
function unsuccessfulRes({ res, status = 400, msg = 'Bad Request' }) {
  return res.status(status).json({
    success: false,
    error: {
      status,
      msg,
    },
    data: null,
  })
}

// UNAUTHORIZED RESPONSE
function unauthorizedRes({ res, status = 401, msg = 'UNAUTHORIZED' }) {
  return res.status(status).json({
    success: false,
    error: {
      status,
      msg,
    },
    data: null,
  })
}

// * Exports * //
module.exports = {
  successfulRes,
  unsuccessfulRes,
  unauthorizedRes,
}
