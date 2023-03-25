# Concept One

In this version of the previous [vulnerable Server](Vulnerable%20Server/index.js), you can find a solution based on regular IP-Checks in every requests.

## How does this work?

In Every requests, the current IP address will be compared with the IP address used for the Login in the Account.  
If the IP address is different, the session and its token will be deleted and the user has to login again.

## What does it prevent?

If an Attacker tries to use a stolen token with a unknown ip address, the Account will be saved by deleting the exposed session.

## What are the Problems?

IP addresses can change regularly if the user switches to a mobile network or the ISP refreshes their IP. A solution for that is not checking IP-Adresses when using mobile devices, because mobile device (for example: the iPhone) are not vulnerable to these exploits because it is nearly impossible to export data from the Safari Browser.    
This Concept does not include multiple device support, so if you use a different devices with different IPs, you will need to login every single time you switch devices.

## Instructions

To test this solution, please use the instructions based on the [original repository owner](https://github.com/sohamkamani/nodejs-session-cookie-example):

Before we begin, we need to install the libraries that we will use for this example:

```
npm install
```

To start the application, we can run:

```sh
node index.js
```

Now, using any HTTP client with support for cookies (like [Postman](https://www.getpostman.com/apps), or your web browser) make a sign-in request with the appropriate credentials:

```
POST http://localhost:8080/signin

{"username":"user2","password":"password2"}
```

You can now try hitting the welcome route from the same client to get the welcome message:

```
GET http://localhost:8080/welcome
```

Hit the refresh route, and then inspect the clients cookies to see the new value of the `session_token`:

```
POST http://localhost:8080/refresh
```

Finally, call the logout route to clear session data:

```
GET http://localhost:8080/logout
```

Calling the welcome and refresh routes after this will result in a `401` error.
