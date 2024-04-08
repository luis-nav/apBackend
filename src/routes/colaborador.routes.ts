import { Router } from "express";

import { asignarProyecto, eliminarColaborador, getAllColaboradores, getColaborador, getColaboradoresDisponibles, logearColaborador, modificarColaborador, modificarColaboradorAdmin, registrarColaborador } from "../controllers/colaborador.controller";

const router = Router();

router.get("/", getAllColaboradores)
router.get("/disponibles", getColaboradoresDisponibles)
router.get("/:cedula", getColaborador)
router.post("/", registrarColaborador)
router.post("/login", logearColaborador)
router.put("/:cedula", modificarColaborador)
router.delete("/:cedula", eliminarColaborador)
router.post("/:cedula/proyecto", asignarProyecto)
router.put("/:cedula/admin", modificarColaboradorAdmin)

export default router;