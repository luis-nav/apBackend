import { Router } from "express";
import { actualizarTarea, crearTarea, eliminarTarea, getTarea, getTareas } from "../controllers/tarea.controller";

const router = Router();

router.get("/", getTareas);

router.get("/:nombre", getTarea);

router.post("/", crearTarea);

router.put("/:nombre", actualizarTarea);

router.delete("/:nombre", eliminarTarea)

export default router;