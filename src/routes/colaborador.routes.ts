import { Router } from "express";

import { asignarDepartamento, asignarProyecto, getAllColaboradores, getColaborador, logearColaborador, modificarColaborador, registrarColaborador } from "../controllers/colaborador.controller";

const router = Router();

router.get("/", getAllColaboradores)
router.get("/:cedula", getColaborador)
router.post("/", registrarColaborador)
router.post("/login", logearColaborador)
router.put("/:cedula", modificarColaborador)
router.post("/:cedula/proyecto", asignarProyecto)
router.post("/:cedula/departamento", asignarDepartamento)

export default router;