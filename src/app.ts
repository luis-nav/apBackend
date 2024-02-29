import express, { Express, Request, Response } from "express";

import apiRouter from "./routes/api.routes"

const app: Express = express();

app.use(express.json());

app.use("/api", apiRouter)

app.get("*", (req: Request, res:Response) => {
    return res.status(404).json({ message: "La ruta no existe"});
});

export default app