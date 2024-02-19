import express, { Express, Request, Response } from "express";

const app: Express = express();

app.use(express.json());


app.get("*", (req: Request, res:Response) => {
    return res.status(404).json({ message: "La ruta no existe"});
});

export default app