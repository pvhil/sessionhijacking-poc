# Session Hijacking Prevention - A Proof of Concept

Many Companies and Websites are vulnerable to [Session Hijacking](https://en.wikipedia.org/wiki/Session_hijacking), a way to get access to a personal or even a corporate account

## How does Session Hijacking Work?

Many Websites use Session-Tokens for Authentication which are stored in Cookies.  
These Tokens are linked to Website-Accounts.  
A browser is automatically logged in, when a Session-Token is available and sent between requests.  
This is great if you do not want your users to login every time they open their browser.  
In Short: Session-Token <-> Access to Account

Attackers can retrieve these Tokens in numerous Ways like:

- Social Engineering
- Malicous Code
- XSS Attacks

I provided a list of Attacking Methods in [Attack Methods](Attack%20Methods).  
But I will not provide requirements for malicous Code or documentation

### The Problem

An Attacker gets full access to an account, if he receives a Session-Token, till the Session-Token gets invalid or the vulnerable user removes every logged-in Device.  
Many Website do not check if the Environment of the Session-Token (Like Browser Information, IP Information) changes.  
So that is why Attackers will not be logged out automatically, if they use a strange Token  
Newest Example: [Linus Tech Tips got hacked](https://www.youtube.com/watch?v=yGXaAWbzl5A)

A Node.JS Webserver example can you find [here](Vulnerable%20Server/index.js)

## My Solutions

In this Repository I will show you concepts of preventing Session Hijacking based on the vulnerable Webserver which you can find [here](Vulnerable%20Server/index.js).

In the Concept-folders you will find a Webserver based on Node.JS and Express. To test these programs, please run the Webserver and access it with the including test.http file in the directory

### Concept 1

In [Concept 1](Concept1) you will find a way to prevent these attacks with regular IP checks and also a pro and contra list of this solution

### Concept 2

In [Concept 1](Concept1) you will find a way to prevent these attacks with regular IP checks, IP Lookups and also a pro and contra list of this solution

## Information

This Project is based on [https://github.com/sohamkamani/nodejs-session-cookie-example](https://github.com/sohamkamani/nodejs-session-cookie-example), a great Repository to get started with Session Cookies in Node.JS.
I included Attack Methods from [https://www.thepythoncode.com/article/extract-chrome-cookies-python](https://www.thepythoncode.com/article/extract-chrome-cookies-python) and you can view it on [GitHub](https://github.com/x4nth055/pythoncode-tutorials).  
Both Projects are licensed with the MIT-License.  
The Base Code from these Projects are used in my Repository/Proof of Concept. I am not the original owner of the original Code from these projects.

I tried GitHub Copilot by using it writing comments in code.  
This is my first Proof of Concept as an IT-Student, so please create Issues and Pull Requests if you have better ideas.
