# KamerLink


## Project Idea
A service that lets students vote on, create initiaves for their school, socialize and share news with each other.

## High level idea implementaion

The service will consist of multipple parts

### Frontend
Will be written in TypeScript+React and is going to be hosted on vercel (may change later on)

### Backend
Will be written in Rust using Axum as backbone. Will be hosted separately on render (at the start) if the idea is successfully implemented and there are more users than expected there will be two options:
- Continue using render but without a free tier
- Switch to a cheaper alternative

### Database
Backend will communicate with the MongoDB database. It will mostly store the Initiatives and their locations

512 MB mongoDB on free tier should be enough for the scale of the application.


### Image storage
Will be decided when upon successful implementation of the post API


### User authorization
Users will be able to login using their school email only. Auth0 will be used as the backbone for user authorization.



## Documentation of the code structure

The codebase is seperated into two parts:
- Backend
- Frontend

Documentation for each of the parts is stored in ./frontend/README.MD and ./backend/README.MD respectively 





## TODO

- See issues