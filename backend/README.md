# Cocktails

Create Docker Image using
    docker build -t cocktails . 

Create DB 
    docker exec CocktailsDB psql -h localhost -p 5432 -U postgres --command "create database cocktails;"

    psql postgresql://postgres:postgres@localhost:23456/cocktails


To Do
    Give some indication of type e.g. Sour, Sweet, Boozy, etc.
        - Colour of Card Edge
        - Symbol in bottom right
    Send chosen cocktail to bar where recipe is automatically displayed
        - If multiple of the same drink, multiply amount
    Ingredient-Ingredient table
        - link Lemon Juice, Peel, etc. with Lemon Availability