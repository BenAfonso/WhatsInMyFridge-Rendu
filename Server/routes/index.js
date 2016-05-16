var express = require('express');
var router = express.Router();

var items = require('./items');
var users = require('./users');
var categories = require('./categories');
var recipes = require('./recipes');
var products = require('./products');
var ingredients = require('./ingredients');


// Todo : Search for // Change HERE in recipe.js

/*
*   Routes that can be accessed only by authenticated users
*/

// Items TODO Security check user_id using product
router.get('/api/v2/products/:product_id/items', items.getItems);
router.post('/api/v2/products/:product_id/items', items.addItem);
router.get('/api/v2/products/:product_id/items/:id', items.getItem);
router.put('/api/v2/products/:product_id/items/:id', items.modifyItem);
router.delete('/api/v2/products/:product_id/items/:id', items.deleteItem);


// Categories
router.get('/api/v2/categories', categories.getCategories);
router.post('/api/v2/categories', categories.addCategory);
router.put('/api/v2/categories/:id', categories.modifyCategory);
router.delete('/api/v2/categories/:id', categories.deleteCategory);

// Products

router.get('/api/v2/products', products.getProducts);
router.post('/api/v2/products', products.addProduct);
router.get('/api/v2/products/:id', products.getProduct);
router.put('/api/v2/products/:id', products.modifyProduct);
router.delete('/api/v2/products/:id', products.deleteProduct);


// Recipes
router.get('/api/v2/recipes', recipes.getRecipes);
router.get('/api/v2/recipes/:id', recipes.getRecipe);
router.post('/api/v2/recipes', recipes.addRecipe);
router.put('/api/v2/recipes/:id', recipes.modifyRecipe);
router.delete('/api/v2/recipes/:id', recipes.deleteRecipe);

// Ingredients
router.get('/api/v2/recipes/:id/ingredients', ingredients.getIngredients);
router.post('/api/v2/recipes/:id/ingredients', ingredients.addIngredient);
router.delete('/api/v2/recipes/:recipe_id/ingredients/:product_id', ingredients.deleteIngredient);
router.put('/api/v2/recipes/:recipe_id/ingredients/:product_id', ingredients.modifyIngredient);

// Profile
router.get('/api/v2/users/me', users.me);

/*
*   Routes that can be accessed only by authenticated and authorized users
*/

// Users
router.get('/api/v2/admin/users', users.getUsers);
router.put('/api/v2/admin/users/:id', users.updateUser);


module.exports = router;
