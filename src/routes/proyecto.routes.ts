import { Router } from "express";

import cambioRouter from "./cambio.routes"
import recursoRouter from "./recurso.routes"
import tareaRouter from "./tarea.routes"
import { actualizarEstadoProyecto, actualizarProyecto, addColab, crearProyecto, eliminarProyecto, getColabs, getProyecto, getProyectos, removeColab } from "../controllers/proyecto.controller";

const router = Router();

router.get("/", getProyectos);

router.get("/:nombre", getProyecto);

router.post("/", crearProyecto);

router.put("/:nombre", actualizarProyecto);

router.post("/:nombre/estado", actualizarEstadoProyecto)

router.delete("/:nombre", eliminarProyecto);

router.post("/:nombre/colab", addColab);

router.delete("/:nombreProyecto/colab/:correoColab", removeColab);

router.get("/:nombre/colab", getColabs)

router.use("/", tareaRouter);

router.use("/", recursoRouter);

router.use("/", cambioRouter)

export default router;