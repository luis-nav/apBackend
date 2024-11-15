import mongoose, { Schema } from "mongoose";
import { compare, genSalt, hash } from "bcrypt";

import { Colaborador } from "../interfaces/colaborador.interface";

const colaboradorSchema = new mongoose.Schema({
    cedula: {
        type: String,
        index: { unique: true },
        required: true,
    },
    nombre: {
        type: String,
        required: true,
    },
    correo: {
        type: String,
        required: true,
        unique: true,
    },
    departamento: {
        type: String,
        required: true,
    },
    telefono: {
        type: String,
        required: true,
    },
    proyecto: {
        type: Schema.Types.ObjectId,
        ref: "Proyecto",
        default: null
    },
    contrasena: {
        type: String,
        required: true,
    },
    admin: {
        type: Boolean,
        default: false,
    },
    estado: {
        type: Boolean,
        default: true,
    }
});

colaboradorSchema.pre("save", async function(next) {
    const colaborador = this;

    if (!colaborador.isModified("contrasena")) return next();

    const salt = await genSalt(8);

    colaborador.contrasena = await hash(colaborador.contrasena, salt);

    next();
});

colaboradorSchema.methods.validarContrasena = function(contrasenaCandidata: string, callback: (err: Error | null, esValida: boolean) => any) {
    compare(contrasenaCandidata, this.contrasena, function(err, esValida) {
        if (err) { return callback(err, false) };
        return callback(null, esValida);
    })
};

export const ColaboradorModel = mongoose.model<Colaborador>("Colaborador", colaboradorSchema);