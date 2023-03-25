// Description: 2nd Concept
// Save IP address and IPLookup Information in Session and compare them regularly

// Based on https://github.com/sohamkamani/nodejs-session-cookie-example

const uuid = require("uuid");

// Use Whois to Lookup IP Address
const whois = require("whois-json");

const users = {
  user1: "password1",
  user2: "password2",
};

// Save IP address and whois information in Session
class Session {
  constructor(username, expiresAt, ip, ipinformation) {
    this.username = username;
    this.expiresAt = expiresAt;
    this.ip = ip;
    this.ipinformation = ipinformation;
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

  // On Login, the IP address is saved in the Session, and the IP address is looked up with Whois, and the Lookup is saved in the Session
  // On Every Request, the IP address is compared with the IP address in the Session
  // If the IP address is different, a new whois lookup is done, comparing old and new values
  // If the lookup is nearly the same, the Session is not deleted (ISP refreshed the IP)
  // If the lookup is different, the Session is deleted (for example: New ISP, New Country, New City, New Home Network, New Office Network, New Mobile Network, New Public Wifi, New Proxy, New VPN)

  // Problem?
  // Data Security, data protection laws etc...
  // In Production, Only save the data needed for the application, not the whole whois lookup

  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  (async function () {
    var ipinformation = await whois(ip);
    const session = new Session(username, expiresAt, ip, ipinformation);

    sessions[sessionToken] = session;
    console.log(session);

    res.cookie("session_token", sessionToken, { expires: expiresAt });
    res.end();
  })();
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
  // Deleting the session when IP address changes dramatically
  // For Example: New ISP, New Country, New City, New Home Network, New Office Network, New Mobile Network, New Public Wifi, New Proxy, New VPN
  // Removes the problem, if the ISP updates the IP address regularly

  // Doing this with every request is not a good idea
  // Because it is not necessary to do this with every request, performance is not optimal
  // Especially if IPLookup is used to get the location of the IP address with every requests
  // Solution: Do this only when the IP address changes

  // var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  console.log("Session IP:" + userSession.ip);
  console.log("New IP: " + ip);

  if (userSession.ip !== ip) {
    // Lookup does not work in a Testing Environment because the Ip address is not a real IP address, it is a Localhost IP address
    // Solution: Replace IP Variable with a random and real IP address. for example: Your real Ip address
    (async function () {
      var ipinformation = await whois(ip);
      // Examples of deleting the session when the IP address changes dramatically (Country, ISP)
      if (userSession.ipinformation.country !== ipinformation.country) {
        delete sessions[sessionToken];
        res.status(401).end();
        console.log("Deleted session because of Country change");
        return;
      }
      if (userSession.ipinformation.netname !== ipinformation.netname) {
        delete sessions[sessionToken];
        res.status(401).end();
        console.log("Deleted session because of ISP change");
        return;
      }
      console.log(
        "Not Deleting Session: The original ISP has maybe refreshed the IP address"
      );
      // Not Deleting Session: The original ISP has maybe refreshed the IP address

      // Create a new Session with the new IP address
      // Suboptimal: New IP address is now the "Main IP address" of the Session, and the old IP address is not saved anymore. But New Session = new token = more safety
      // Can not find a problem with that, but i think it is not optimal
      const newSessionToken = uuid.v4();

      const now = new Date();
      const expiresAt = new Date(+now + 120 * 1000);
      const session = new Session(
        userSession.username,
        expiresAt,
        ip,
        ipinformation
      );

      sessions[newSessionToken] = session;
      delete sessions[sessionToken];

      res.cookie("session_token", newSessionToken, { expires: expiresAt });
    })();
  }

  res
    .send(
      `New ISP IP/Old IP and Same Session: Welcome  ${userSession.username}!`
    )
    .end();
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

  // when the IP address changes dramatically, the session is deleted
  // But if not, new Information about the IP address is saved in the session
  // But not good enough, because the the session can be hijacked between the refreshs

  // we can look up the IP every refresh, because refreshs are not called every request

  // const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  console.log("Refreshing session...\nSession IP:" + userSession.ip);
  console.log("New IP: " + ip);

  // Lookup does not work in a Testing Environment because the Ip address is not a real IP address, it is a Localhost IP address
  // Solution: Replace IP Variable with a random and real IP address. for example: Your real Ip address

  (async function () {
    var ipinformation = await whois(ip);
    // Examples of deleting the session when the IP address changes dramatically (Country, ISP)
    if (userSession.ip !== ip) {
      delete sessions[sessionToken];
      res.status(401).end();
      console.log("Deleted session because of IP change");
      return;
    }
    if (userSession.ipinformation.country !== ipinformation.country) {
      delete sessions[sessionToken];
      res.status(401).end();
      console.log("Deleted session because of Country change");
      return;
    }
    if (userSession.ipinformation.netname !== ipinformation.netname) {
      delete sessions[sessionToken];
      res.status(401).end();
      console.log("Deleted session because of ISP change");
      return;
    }
    console.log(
      "Not Deleting Session, refreshing session with fresh information about the IP address"
    );
    // Not Deleting Session, refreshing session with fresh information about the IP address

    // new session with new information
    const newSessionToken = uuid.v4();

    const now = new Date();
    const expiresAt = new Date(+now + 120 * 1000);
    const session = new Session(
      userSession.username,
      expiresAt,
      ip,
      ipinformation
    );

    sessions[newSessionToken] = session;
    delete sessions[sessionToken];

    res.cookie("session_token", newSessionToken, { expires: expiresAt });
    res.status(200).end();
  })();
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
// The IPLook is good for getting information about the IP address.
// So we do not have the problem anymore when the isp changes the IP address.
// What about multiple device usage?
// Right now, only one IP address is valid when logged in.
// So we need to save multiple IP addresses in the session (arrays for example)
