import { Router } from "express";
import { getReuniones, crearReunion, eliminarReunion, addColab } from "../controllers/reunion.controller";

const router = Router();

router.get("/:nombre", getReuniones);

router.post("/:nombreProyecto", crearReunion);

router.delete("/:proyecto/:temaReunion", eliminarReunion);

router.post("/:proyecto/colab", addColab);

export default router;