import { Router } from "express";

import { registrarColaborador } from "../controllers/colaborador.controller";

const router = Router();

router.post("/", registrarColaborador)

export default router;