import { Router } from "express";

import tareaRouter from "./tarea.routes"
import { actualizarEstadoProyecto, actualizarProyecto, crearProyecto, eliminarProyecto, getProyecto, getProyectos } from "../controllers/proyecto.controller";

const router = Router();

router.get("/", getProyectos);

router.get("/:nombre", getProyecto);

router.post("/", crearProyecto);

router.put("/:nombre", actualizarProyecto);

router.post("/:nombre/estado", actualizarEstadoProyecto)

router.delete("/:nombre", eliminarProyecto);

router.use("/", tareaRouter)

export default router;