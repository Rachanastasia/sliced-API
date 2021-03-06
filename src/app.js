require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { NODE_ENV } = require('./config');
const userRouter = require('./user/user-router');
const authRouter = require('./auth/auth-router');
const recipeRouter = require('./recipes/recipes-router');
const requireAuth = require('./middleware/jwt-auth.js')
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');


const app = express();

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption));
app.use(express.json());
app.use(cors());

app.use('/api/users', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/recipes', recipeRouter)

app.use('/graphql', requireAuth, graphqlHTTP(req => ({
    schema,
    graphiql: true,
    context: {
        user: req.user,
        db: req.app.get('db')
    }
})))


app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.log(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app;