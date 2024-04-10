import { Router } from "express";

import { addRecurso, getRecursos, removeRecurso } from "../controllers/recurso.controller";

const router = Router();

router.get("/:nombreProyecto/recursos", getRecursos);

router.post("/:nombreProyecto/recursos", addRecurso);

router.patch("/:nombreProyecto/recursos", removeRecurso);

export default router;