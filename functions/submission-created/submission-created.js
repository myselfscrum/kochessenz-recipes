const axios = require('axios')
const uuid = require('uuid').v4
const dayjs = require('dayjs')
const crypto = require('crypto')
const utc = require('dayjs/plugin/utc')

dayjs.extend(utc)

exports.handler = (event, context, callback) => {
  const payload = JSON.parse(event.body).payload
  console.log(payload.data)
  const { firstname, lastname, email, message, referrer } = payload.data
  console.log (firstname)
  console.log (lastname)
  console.log (email)
  console.log (message)
  console.log (referrer)
  return { 
    statusCode: 200, 
    body: "Success!" 
  }; 
}