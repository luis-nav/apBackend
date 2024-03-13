import { Router } from "express";
import { actualizarProyecto, crearProyecto, eliminarProyecto, getProyecto, getProyectos } from "../controllers/proyecto.controller";

const router = Router();

router.get("/", getProyectos);

router.get("/:nombre", getProyecto);

router.post("/", crearProyecto);

router.put("/:nombre", actualizarProyecto);

router.delete("/:nombre", eliminarProyecto)

export default router;