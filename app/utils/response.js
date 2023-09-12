const appResponse = (response, statusCode = 200, message = 'ok', data) => {
  return response.status(statusCode).json({
    status: statusCode || 200,
    message: message || 'ok',
    data
  })
}

const joiError = (response, error) => {
  const errData = error?.details?.map(detail => ({
    message: detail.message,
    key: detail.context.key
  }))

  return response.status(400).json({
    status: 400,
    message: error.details[0].message || 'Validation Error',
    data: errData
  })
}

module.exports = {
  appResponse,
  joiError
}
