// Description: 1st Concept
// Save IP address in Session and compare them every request

// Based on https://github.com/sohamkamani/nodejs-session-cookie-example

const uuid = require("uuid");

const users = {
  user1: "password1",
  user2: "password2",
};

// Save IP address in Session
class Session {
  constructor(username, expiresAt, ip) {
    this.username = username;
    this.expiresAt = expiresAt;
    this.ip = ip;
  }

  isExpired() {
    this.expiresAt < new Date();
  }
}

const sessions = {};

// SIGNIN HANDLER

const signinHandler = (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    res.status(401).end();
    return;
  }

  const expectedPassword = users[username];
  if (!expectedPassword || expectedPassword !== password) {
    res.status(401).end();
    return;
  }

  const sessionToken = uuid.v4();

  const now = new Date();
  const expiresAt = new Date(+now + 120 * 1000);

  // Save IP address in Session
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const session = new Session(username, expiresAt, ip);

  sessions[sessionToken] = session;

  res.cookie("session_token", sessionToken, { expires: expiresAt });
  res.end();
};

// WELCOME HANDLER

const welcomeHandler = (req, res) => {
  if (!req.cookies) {
    res.status(401).end();
    return;
  }

  const sessionToken = req.cookies["session_token"];
  if (!sessionToken) {
    res.status(401).end();
    return;
  }

  userSession = sessions[sessionToken];
  if (!userSession) {
    res.status(401).end();
    return;
  }

  if (userSession.isExpired()) {
    delete sessions[sessionToken];
    res.status(401).end();
    return;
  }

  // Proof of Concept
  // Deleting the session when IP address changes

  // Why not optimal?
  // IP address can change when using a VPN
  // IP address can change when using a Proxy
  // IP address can change when using a Mobile Network
  // IP address can change when using a Public Wifi
  // IP address can change when using a new Home Network
  // IP address can change when using a new Office Network
  // IP address can change when ISP changes the IP address

  // Doing this in a real world application is not a good idea
  // But it is a good idea to log the IP address and compare it with the IP address of the session
  // If the IP address changes, the session should be deleted
  // This is a good idea to prevent session hijacking
  // But it is not a good idea to delete the session when the IP address changes
  // Because the IP address can change for many reasons

  // Doing this with every request is not a good idea
  // Because it is not necessary to do this with every request, performance is not optimal
  // Solution: Maybe once an hour

  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  console.log("Session IP:" + userSession.ip);
  console.log("New IP: " + ip);
  if (userSession.ip !== ip) {
    delete sessions[sessionToken];
    res.status(401).end();
    console.log("Deleted session because of IP address change");
    return;
  }

  res.send(`Same IP and Same Session: Welcome  ${userSession.username}!`).end();
};

// REFRESH HANDLER

const refreshHandler = (req, res) => {
  if (!req.cookies) {
    res.status(401).end();
    return;
  }

  const sessionToken = req.cookies["session_token"];
  if (!sessionToken) {
    res.status(401).end();
    return;
  }

  userSession = sessions[sessionToken];
  if (!userSession) {
    res.status(401).end();
    return;
  }
  if (userSession.isExpired()) {
    delete sessions[sessionToken];
    res.status(401).end();
    return;
  }

  // Refreshing Token with new IP address
  // Proof of Concept

  // When Token is being refreshed, the ip should be checked
  // If the IP address changes, the session should be deleted

  // Can we only check IP address when refreshing the token?
  // No, because the the session can be hijacked between the refreshs

  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  console.log("Refreshing session...\nSession IP:" + userSession.ip);
  console.log("New IP: " + ip);
  if (userSession.ip !== ip) {
    delete sessions[sessionToken];
    res.status(401).end();
    console.log("Deleted session because of IP address change");
    return;
  }
  const newSessionToken = uuid.v4();

  const now = new Date();
  const expiresAt = new Date(+now + 120 * 1000);
  const session = new Session(userSession.username, expiresAt, ip);

  sessions[newSessionToken] = session;
  delete sessions[sessionToken];

  res.cookie("session_token", newSessionToken, { expires: expiresAt });
  res.status(200).end();
};

// LOGOUT HANDLER

const logoutHandler = (req, res) => {
  if (!req.cookies) {
    res.status(401).end();
    return;
  }

  const sessionToken = req.cookies["session_token"];
  if (!sessionToken) {
    res.status(401).end();
    return;
  }

  delete sessions[sessionToken];

  res.cookie("session_token", "", { expires: new Date() });
  res.end();
};

module.exports = {
  signinHandler,
  welcomeHandler,
  refreshHandler,
  logoutHandler,
};

// Conclusion:
// This is a Proof of Concept
// This is not a real world application
// It is not a good idea to delete the session when the IP address changes
// Because of IP refreshes from the ISP, using other devices and other reasons
