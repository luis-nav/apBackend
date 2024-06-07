import { Router } from "express";
import { postearMensaje, postearMensajeProyecto, postearRespuesta, postearRespuestaProyecto } from "../controllers/mensajes.controller";

const router = Router()

router.post("/general", postearMensaje);

router.post("/:proyecto", postearMensajeProyecto);

router.post("/general/respuesta/:_id", postearRespuesta);

router.post("/:proyecto/respuesta/:_id", postearRespuestaProyecto);

export default router;