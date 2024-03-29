import { Router } from "express";
import { getForoProyecto, getForoGeneral, crearForoProyecto } from "../controllers/foro.controller";

const router = Router();

router.get("/", getForoGeneral);

router.get("/:proyecto", getForoProyecto);

router.post("/:proyecto", crearForoProyecto);

export default router;