CREATE DOMAIN role_domain VARCHAR(6) CHECK( VALUE IN ('user','admin') );


----------------
------- TABLES
----------------

CREATE TABLE Users (
  idUser SERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL CONSTRAINT unique_username UNIQUE,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  role role_domain NOT NULL DEFAULT 'user'
);

CREATE TABLE Categories (
  idCategory SERIAL PRIMARY KEY,
  categoryName VARCHAR(50),
  idUser INT references Users(idUser) ON DELETE CASCADE
);

CREATE TABLE Products (
  idProduct SERIAL PRIMARY KEY,
  idCategory INT references Categories(idCategory) ON DELETE SET NULL,
  productName VARCHAR(50) NOT NULL,
  img TEXT,
  idUser INT references Users(idUser) ON DELETE CASCADE
);


CREATE TABLE Items (
  idItem SERIAL PRIMARY KEY,
  idProduct INT references Products(idProduct) ON DELETE CASCADE,
  idUser INT references Users(idUser) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit VARCHAR(15) NOT NULL,
  max NUMERIC,
  created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE Recipes (
  idRecipe SERIAL PRIMARY KEY,
  recipeName VARCHAR(50),
  idUser INT references Users(idUser) ON DELETE CASCADE
);

CREATE TABLE Ingredients (
  idRecipe INT references Recipes(idRecipe) ON DELETE CASCADE,
  idProduct INT references Products(idProduct) ON DELETE CASCADE,
  quantity NUMERIC,
  PRIMARY KEY (idRecipe, idProduct)
);

CREATE TABLE Logs (
  idProduct INT references Products(idProduct) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  recorded_on DATE DEFAULT CURRENT_DATE
);


----------------
------- TRIGGERS
----------------


-- Enregistrer dans un journal chaque consommation d'un produit
-- afin de permettre par la suite des statistiques et un suivi
-- de la consommation pour chaque produit
CREATE OR REPLACE FUNCTION proc_write_consumption_logs() RETURNS TRIGGER AS $write_consumption_logs$
  DECLARE
    delta_stock NUMERIC;
  BEGIN
    --
    -- Write each product consumption on the Log table
    --
    IF (TG_OP = 'DELETE') THEN
      INSERT INTO Logs (idProduct, quantity) VALUES (OLD.idProduct, -OLD.quantity);
    ELSIF (TG_OP = 'UPDATE') THEN
      delta_stock = (NEW.quantity - OLD.quantity);
      -- If the stock is the same, do nothing
      IF (delta_stock = 0) THEN RETURN NULL; END IF;
      INSERT INTO Logs (idProduct, quantity) VALUES (NEW.idProduct, delta_stock);
    ELSIF (TG_OP = 'INSERT') THEN
      INSERT INTO Logs (idProduct, quantity) VALUES (NEW.idProduct, NEW.quantity);
    END IF;
    RETURN NULL;
  END;
$write_consumption_logs$ LANGUAGE plpgsql;


CREATE TRIGGER write_consumption_logs AFTER UPDATE OR INSERT OR DELETE
ON Items
FOR EACH ROW
EXECUTE PROCEDURE proc_write_consumption_logs();





-- Supprime les entrées journal d'un produit lors de la suppression de ce dernier
CREATE OR REPLACE FUNCTION proc_remove_log_entries() RETURNS TRIGGER AS $remove_log_entries$
  BEGIN
    DELETE FROM Logs WHERE idProduct = OLD.idProduct;
    RETURN NULL;
  END;
$remove_log_entries$ LANGUAGE plpgsql;

CREATE TRIGGER remove_log_entries AFTER DELETE
ON Products
FOR EACH ROW
EXECUTE PROCEDURE proc_remove_log_entries();




-- Verifier si le produit et la recette concernent le même utilisateur
-- lors d'une insertion dans Ingredients
CREATE OR REPLACE FUNCTION proc_check_user_on_insert() RETURNS TRIGGER AS $check_user_on_insert$
  DECLARE
    recipe_user_id INTEGER;
    product_user_id INTEGER;
  BEGIN
    recipe_user_id = (SELECT DISTINCT idUser FROM Recipes WHERE idRecipe = NEW.idrecipe);
    product_user_id = (SELECT DISTINCT idUser FROM Products WHERE idProduct = NEW.idProduct);
    IF recipe_user_id != product_user_id THEN
      RAISE EXCEPTION 'the user and the recipe dont have the same owner';
      RETURN NULL;
    END IF;
    RETURN NEW;
  END;
$check_user_on_insert$ LANGUAGE plpgsql;

CREATE TRIGGER check_user_on_insert BEFORE INSERT
ON Ingredients
FOR EACH ROW
EXECUTE PROCEDURE proc_check_user_on_insert();
