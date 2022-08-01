# Express Clone
Simple express clone built using only NodeJs and Typescript, for learning purposes.

## Description

### Features
The idea of this project was to reproduce the most common features of express. The implemented features are listed below and should be used in the same way as in the express documentation:
- HTTP Methods
[x] GET
[x] POST
[x] DELETE
[x] PATCH
[x] PUT
- Request Parameters
[x] Body - [req.body](http://expressjs.com/en/5x/api.html#req.body)
[x] Route - [req.params](http://expressjs.com/en/5x/api.html#req.params)

### Example API
For example purposes I've created a simple CRUD API to manage users. The following endpoints are implemented:
- GET /users - list users
- GET /users/:userId - show user
- POST /users - create user
- PATCH /users/:userId - update user
- DELETE /users/:userId - delete user

You can access the API docs on postman [here](https://app.getpostman.com/join-team?invite_code=99aa95a94ab3870895dae5e2e2f5b265&target_code=1b398b15704ad6188057957b6366deec)

## Dependencies
* node
* `npm`

## Quick start
### Install
```bash
  npm install
```

### Run
```bash
  npm start
```

## Author

Marcelo Miyachi
[github](https://github.com/marcelo1811)
[linkedin](https://www.linkedin.com/in/marcelo-miyachi-17a67a12b/)
