import { Router } from "express";

import cambioRouter from "./cambio.routes"
import recursoRouter from "./recurso.routes"
import tareaRouter from "./tarea.routes"
import { actualizarEstadoProyecto, actualizarProyecto, addColab, crearProyecto, eliminarProyecto, getProyecto, getProyectos, removeColab } from "../controllers/proyecto.controller";

const router = Router();

router.get("/", getProyectos);

router.get("/:nombre", getProyecto);

router.post("/", crearProyecto);

router.put("/:nombre", actualizarProyecto);

router.post("/:nombre/estado", actualizarEstadoProyecto)

router.delete("/:nombre", eliminarProyecto);

router.post("/:nombre/colab", addColab);

router.delete("/:nombre/colab", removeColab);

router.use("/", tareaRouter);

router.use("/", recursoRouter);

router.use("/", cambioRouter)

export default router;