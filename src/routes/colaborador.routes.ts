import { Router } from "express";

import { logearColaborador, registrarColaborador } from "../controllers/colaborador.controller";

const router = Router();

router.post("/", registrarColaborador)
router.post("/login", logearColaborador)

export default router;