import { Router } from "express";

import { asignarDepartamento, asignarProyecto, logearColaborador, modificarColaborador, registrarColaborador } from "../controllers/colaborador.controller";

const router = Router();

router.post("/", registrarColaborador)
router.post("/login", logearColaborador)
router.put("/:cedula", modificarColaborador)
router.post("/:cedula/proyecto", asignarProyecto)
router.post("/:cedula/departamento", asignarDepartamento)

export default router;