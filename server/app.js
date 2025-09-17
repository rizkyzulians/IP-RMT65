require('dotenv').config();

const express = require('express')
const app = express()
const port = 3000
const userController = require('./controllers/userController')
const recipeController = require('./controllers/recipeController')

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

app.post('/register', userController.register);
app.post('/login', userController.login);

app.get('/pub/recipes', recipeController.getAllRecipePub);


app.listen(port, () => {
  console.log(`app listening on port http://localhost:${port}`)
})

module.exports = app