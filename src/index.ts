import mongoose from "mongoose";
import 'dotenv/config'

import app from "./app";

const port: string | number = process.env.PORT || 3000;
const uri: string = process.env.DB_URI || "";

const main = async () => {
    await mongoose.connect(uri)
        .then(() => console.log("[server]: Database connected"));

    app.listen(port, () =>
        console.log(`[server]: Server is running at http://localhost:${port}`))
};

main();