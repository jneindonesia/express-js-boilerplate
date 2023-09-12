const userModel = require('../models/user.model')
const ApiError = require('../utils/ApiError')

const getUser = async (id) => {
  const result = await userModel.getById(id)
  if (!result.USER_ID) {
    throw new ApiError(404, 'user not found')
  }
  return result
}

const updateUser = async (body, userId) => {
  const result = await getUser(userId)

  const payload = {
    USER_NAME: body.USER_NAME || result.USER_NAME,
    USER_BRANCH: body.USER_BRANCH || result.USER_BRANCH,
    USER_ZONE_CODE: body.USER_ZONE_CODE || result.USER_ZONE_CODE
  }

  await userModel.update(payload, userId)
}

module.exports = {
  getUser,
  updateUser
}
