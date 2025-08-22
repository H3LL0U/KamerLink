# KamerLink


## Project Idea
A service that lets students vote on, create initiaves for their school, socialize and share news with each other.

## High level idea implementaion

The service will consist of 3 parts

### Frontend
Will be written in TypeScript+React and is going to be hosted on vercel (may change later on)

### Backend
Will be written in Rust using Axum as backbone. Will be hosted separately on render (at the start) if the idea is successfully implemented will be hosted on fly.io

### Database
Backend will communicate with the MongoDB database. It will mostly store the Initiatives and their locations

## User authentication
Preferably users should be able to login using their DigiD. However it will not be possible as you need the permission from signincat which probably might not be possible since it is a government service. For this reason the initial implementation will be using auth0 as the provider.




## TODO

-  Set up user authentication (both for frontend and backend)
-  Set up an initial UI
-  Implement frontend-backend API interactions for submitting and viewing initiatives and the main idea