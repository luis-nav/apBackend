import { Router } from "express";

import departamentoRouter from "./departamento.routes"
import colaboradorRouter from "./colaborador.routes"
import proyectoRouter from "./proyecto.routes"
import reunionRouter  from "./reunion.routes"
import foroRouter from "./foro.routes"
import {addAttachementsAndSend} from "../utils/mail.functions"

const router = Router();

router.use("/departamentos", departamentoRouter)
router.use("/colaboradores", colaboradorRouter)
router.use("/proyectos", proyectoRouter)
router.use("/reuniones", reunionRouter)
router.use("/foros", foroRouter)
router.post("/send", addAttachementsAndSend)

export default router;