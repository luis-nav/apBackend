import { Router } from "express";

import mensajesRouter from "./mensajes.routes"
import { getForoProyecto, getForoGeneral, crearForoProyecto } from "../controllers/foro.controller";

const router = Router();

router.get("/general", getForoGeneral);

router.get("/:proyecto", getForoProyecto);

router.post("/:proyecto", crearForoProyecto);

router.use("/mensajes", mensajesRouter)

export default router;