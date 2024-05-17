// Express
import express, { Express, Request, Response } from "express";

// Cross Origin Policy
import cors from "cors";
import { corsOptions } from "./cors.config";

// API Router
import apiRouter from "./routes/api.routes"

const app: Express = express();

app.use(express.json());

apiRouter.use(cors(corsOptions));

app.use("/api", apiRouter);

app.get("*", (req: Request, res:Response) => {
    return res.status(404).json({ message: "The route does not exist"});
});

export default app