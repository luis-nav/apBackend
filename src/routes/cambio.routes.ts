import { Router } from "express";
import { addCambio, getCambios } from "../controllers/cambio.controller";

const router = Router();

router.get("/:nombreProyecto/cambios", getCambios);

router.post("/:nombreProyecto/cambios", addCambio);

export default router;