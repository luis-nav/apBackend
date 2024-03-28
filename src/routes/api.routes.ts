import { Router } from "express";

import departamentoRouter from "./departamento.routes"
import colaboradorRouter from "./colaborador.routes"
import proyectoRouter from "./proyecto.routes"
import reunionRouter  from "./reunion.routes"
import foroRouter from "./foro.routes"

const router = Router();

router.use("/departamentos", departamentoRouter)
router.use("/colaboradores", colaboradorRouter)
router.use("/proyectos", proyectoRouter)
router.use("/reuniones", reunionRouter)
router.use("/foros", foroRouter)

export default router;