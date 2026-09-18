import express from "express"
import {ENV} from "./config/env.js"
import {db } from "./config/db.js"
import { favoritesTable } from "./db/schema.js";
import { eq } from "drizzle-orm";
import { and } from "drizzle-orm";
import job from "./config/cron.js";

const app = express();
const PORT = ENV.PORT || 5001;

if(ENV.NODE_ENV=== "production") {
    job.start();
}

app.use(express.json())

app.get("/api/health", (req,res)=> {
    res.status(200).json({sucess:true});

});
app.post("/api/favorites", async (req, res)=> {
    try{
        const {userId, recipeId, title, image, cookTime, servings} = req.body;

        if(!userId || !recipeId || !title ){
            return res.status(400).json({error: "Missing required Fields"});
        }

        const newFavorite = await db.insert(favoritesTable).values({
            userId,
            recipeId,
            title,
            image,
            cookTime,
            servings
        }).returning();
        res.status(201).json(newFavorite[0])
    } catch(error){
        console.log("Error adding Favorite", error)
        res.status(500).json({error: "Internal ERR"})
    }
})

app.delete ("/api/favorites/:userId/:recipeId", async(req, res)=>{
    try{
        const {userId, recipeId} = req.params
        await db.delete(favoritesTable).where(and (eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, parseInt(recipeId)))
    )

        res.status(200).json({message: "Favorites Deleted Sucessfully"})

    }catch(error){
        console.log("Error removing a Favorite", error)
        res.status(500).json({error: "Internal ERR"})
    }
})
app.get("/api/favorites/:userId", async(req, res)=>{
    try{
        const {userId} = req.params;
        const userFavorites = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId))

        res.status(200).json(userFavorites)
    }catch(error){
        console.log("Error fetching a Favorite", error)
        res.status(500).json({error: "Internal ERR"})
    }
})
app.listen(PORT, ()=>{
    console.log("Server is running on PORT:", PORT);
})