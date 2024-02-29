import { Router } from "express";

import departamentoRouter from "./departamento.routes"
import colaboradorRouter from "./colaborador.routes"

const router = Router();

router.use("/departamentos", departamentoRouter)
router.use("/colaboradores", colaboradorRouter)

export default router;