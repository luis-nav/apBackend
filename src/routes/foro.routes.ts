import { Router } from "express";
import { getForoProyecto, getForoGeneral, crearForoProyecto } from "../controllers/foro.controller";

const router = Router();

router.get("/:nombre", getForoProyecto);

router.get("/", getForoGeneral);

router.post("/:nombre", crearForoProyecto);

export default router;