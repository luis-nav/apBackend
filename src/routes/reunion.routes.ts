import { Router } from "express";
import { getReuniones, crearReunion, eliminarReunion } from "../controllers/reunion.controller";

const router = Router();

router.get("/:nombre", getReuniones);

router.post("/", crearReunion);

router.delete("/:nombre", eliminarReunion)

export default router;