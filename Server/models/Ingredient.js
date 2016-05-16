function Ingredient(recipe, product, quantity){
  this.recipe = recipe,
  this.product = product,
  this.quantity = quantity
  if (recipe !== undefined)
      this.links = [ {
            "rel": "self",
            "href": "/api/v2/recipes/"+this.recipe.idRecipe+"/ingredients/"+this.product.idProduct
      }];
}

module.exports = Ingredient;
