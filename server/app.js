if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const cors = require('cors')
const express = require('express')
const app = express()
const { authentication } = require('./middlewares/authentication')
const userController = require('./controllers/userController')
const recipeController = require('./controllers/recipeController')
const myListController = require('./controllers/myListController');
const AIController = require('./controllers/aiController');

app.use(cors())

app.use(express.urlencoded({ extended: false}));
app.use(express.json());

// Endpoint AI rekomendasi resep
app.post('/ai/rekomendasi', AIController.rekomendasiResep);

app.get('/pub/recipes', recipeController.getAllRecipePub);
// Endpoint untuk mengambil semua resep (khusus untuk AI)
app.get('/pub/recipes/all', recipeController.getAllRecipesRaw);
app.get('/pub/recipes/:id', recipeController.detailRecipePubbyId)

app.post('/register', userController.register);
app.post('/login', userController.login);
app.post('/login/google', userController.googleLogin);

app.use(authentication);


// MyList endpoints (hanya untuk user yang sudah login)
app.get('/mylist', myListController.getMyList);
app.post('/mylist', myListController.addToMyList);
app.delete('/mylist/:RecipeId', myListController.removeFromMyList);
app.patch('/mylist/:RecipeId', myListController.updateNote);


module.exports = app