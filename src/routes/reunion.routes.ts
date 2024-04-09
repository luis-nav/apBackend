import { Router } from "express";
import { getReuniones, crearReunion, eliminarReunion, addColab } from "../controllers/reunion.controller";

const router = Router();

router.get("/:nombre", getReuniones);

router.post("/", crearReunion);

router.delete("/:nombre", eliminarReunion);

router.post("/:proyecto/colab", addColab);

export default router;