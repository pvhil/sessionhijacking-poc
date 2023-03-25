# A Vulnerable Webserver

This NodeJS Webserver based on Requests is vulnerable to Session Hijacking.  
In the [handlers.js file](handlers.js) you can see that the environment of the user using the Session-Token is not regularly checked.  
An Attacker can retrieve a Session-Token from this Website and can use it on a completely different device without any Problem.

I provided more information about the exploit in the [handlers.js file](handlers.js)

This folder is a fork from [https://github.com/sohamkamani/nodejs-session-cookie-example](https://github.com/sohamkamani/nodejs-session-cookie-example)  
The Concept Folders are also forks from the original repo. But I removed the original comments there to increase readability.
