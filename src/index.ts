import mongoose from "mongoose";
import app from "./app";

const port:number = 3000;
const uri: string = "mongodb+srv://todd:webdev24@pokedexcluster.6rsbbhn.mongodb.net/?retryWrites=true&w=majority";

const main = async () => {
    await mongoose.connect(uri)
        .then(() => console.log("[server]: Database connected"));

    app.listen(port, () =>
        console.log(`[server]: Server is running at http://localhost:${port}`))
};

main();