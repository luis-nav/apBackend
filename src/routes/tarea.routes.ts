import { Router } from "express";
import { actualizarTarea, crearTarea, eliminarTarea, getTareas } from "../controllers/tarea.controller";
// import { actualizarTarea, crearTarea, eliminarTarea, getTarea, getTareas } from "../controllers/tarea.controller";

const router = Router();

router.get("/:nombreProyecto/tareas", getTareas);

// router.get("/:nombre", getTarea);

router.post("/:nombreProyecto/tareas", crearTarea);

router.put("/:nombreProyecto/tareas/:nombre", actualizarTarea);

router.delete("/:nombreProyecto/tareas/:nombre", eliminarTarea)

export default router;