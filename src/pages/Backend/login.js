export function login () {
  const express = require('express')
  const cookieParser = require('cookie-parser')
  const app = express()
  const http = require('http').Server(app)
  const port = 3007
  require('dotenv').config()

  app.use(express.json())
  app.use(cookieParser(process.env.cookieSecret))
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Methods', 'POST')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Credentials', true)
    next()
  })

  app.post('/api/checkUserId', function (req, res) {
    if (req.signedCookies && req.signedCookies.userId === 'korise.k3767') {
      res.send({ loginStatus: true })
    } else {
      res.send({ loginStatus: false })
    }
  })

  app.post('/api/login', function (req, res) {
    const { username, password } = req.body
    if (username === process.env.ACCOUNT && password === process.env.PASS) {
      res.cookie('userId', process.env.ACCOUNT, {
        signed: true,
        httpOnly: true,
        expires: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
      })
      res.send({ loginStatus: true })
    } else {
      res.send({ loginStatus: false })
    }
  })

  http.listen(port, function () {
    console.log('listening on *:3007')
  })
}
