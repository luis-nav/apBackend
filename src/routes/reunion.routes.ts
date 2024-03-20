import { Router } from "express";
import { getReuniones, crearReunion } from "../controllers/reunion.controller";

const router = Router();

router.get("/", getReuniones);

router.post("/", crearReunion);

export default router;