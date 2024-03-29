import { Router } from "express";
import { postearMensaje, postearMensajeProyecto } from "../controllers/mensajes.controller";

const router = Router()

router.post("/", postearMensaje)

router.post("/:proyecto", postearMensajeProyecto)

export default router;