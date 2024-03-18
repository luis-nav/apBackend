import { Router } from "express";

import departamentoRouter from "./departamento.routes"
import colaboradorRouter from "./colaborador.routes"
import proyectoRouter from "./proyecto.routes"
import tareaRouter from "./tarea.routes"

const router = Router();

router.use("/departamentos", departamentoRouter)
router.use("/colaboradores", colaboradorRouter)
router.use("/proyectos", proyectoRouter)
router.use("/tareas", tareaRouter)

export default router;