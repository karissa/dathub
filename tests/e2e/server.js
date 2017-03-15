var fs = require('fs')
var path = require('path')
var testServer = process.env.TEST_SERVER || 'https://datproject.org'

module.exports = new function () {
  var key = fs.readFileSync(path.join(__dirname, '..', 'key.txt')).toString()

  var testCases = this
  testCases['opening the browser and navigating to the url'] = (client) => {
    client
    .url(testServer)
    .assert.containsText('body', 'dat')
  }
  testCases['viewing a dat that doesnt exist gives 404'] = (client) => {
    client
    .url(testServer + '/install')
    .setValue("input[name='import-dat']", 'hello')
    client.keys(client.Keys.ENTER, function (done) {
      client.pause(1000)
      .assert.containsText('body', 'No dat here.')
    })
  }
  testCases['viewing a dat that exists with file list works'] = (client) => {
    client
    .setValue("input[name='import-dat']", key)
    client.keys(client.Keys.ENTER, function (done) {
      client
        .expect.element('#fs').text.to.contain('dat.json').before(5000)
      // client
      //   .expect.element('#peers').text.to.contain('1').before(5000)
      client.click('.directory')
      client.expect.element('#fs').text.to.contain('hello.txt').before(1000)
      client.end()
    })
  }
  testCases['registering an account'] = (client) => {
    client
    .url(testServer + '/register')
    .setValue("input[name='username']", 'joehi')
    .setValue("input[name='email']", 'joe@hi.com')
    .setValue("input[name='password']", 'apassword')
    .click("input[type='submit']")
    client.pause(2000)
    .assert.containsText('body', 'From the terminal')
  }
  testCases['logging into an account with a bad email'] = (client) => {
    client
    .url(testServer + '/login')
    .setValue("input[name='email']", 'joedoesnotexist@hi.com')
    .setValue("input[name='password']", 'apassword')
    .click("input[type='submit']")
    client.pause(2000)
    .assert.containsText('body', 'User does not exists.')
  }
  testCases['logging into an account with a bad password'] = (client) => {
    client
    .url(testServer + '/login')
    .setValue("input[name='email']", 'joe@hi.com')
    .setValue("input[name='password']", 'abadpassword')
    .click("input[type='submit']")
    client.pause(2000)
    .assert.containsText('body', 'Incorrect email and password.')
  }
  testCases['logging into an account with a good password'] = (client) => {
    client
    .url(testServer + '/login')
    .setValue("input[name='email']", 'joe@hi.com')
    .setValue("input[name='password']", 'apassword')
    .click("input[type='submit']")
    client.pause(2000)
    .assert.containsText('body', 'From the terminal')
    client.end()
  }
}
