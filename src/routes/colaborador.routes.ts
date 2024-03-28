import { Router } from "express";

import { logearColaborador, modificarColaborador, registrarColaborador } from "../controllers/colaborador.controller";

const router = Router();

router.post("/", registrarColaborador)
router.post("/login", logearColaborador)
router.put("/:cedula", modificarColaborador)

export default router;