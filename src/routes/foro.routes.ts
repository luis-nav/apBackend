import { Router } from "express";
import { getForoProyecto, getForoGeneral, crearForoProyecto } from "../controllers/foro.controller";

const router = Router();

router.get("/:proyecto", getForoProyecto);

router.get("/", getForoGeneral);

router.post("/:proyecto", crearForoProyecto);

export default router;