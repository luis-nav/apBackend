import { ObjectId } from "mongoose";

import { Mensaje } from "./mensaje.interface";

export interface Foro {
    esDeProyecto: boolean,
    mensajes: Mensaje[],
}