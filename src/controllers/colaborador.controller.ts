import { Request, Response, RequestHandler } from "express";

import { DepartamentoModel } from "../models/departamento.model";
import { ColaboradorModel } from "../models/colaborador.model";

export const registrarColaborador:RequestHandler = async (req: Request, res: Response) => {
    const { cedula, nombre, correo, nombreDepartamento, telefono, contrasena, proyecto } = req.body;
    const departamento = await DepartamentoModel.findOne({ nombre: nombreDepartamento });
    try {
        const colaborador = new ColaboradorModel({
            cedula,
            nombre,
            correo,
            departamento,
            telefono,
            contrasena,
            proyecto: proyecto ? proyecto : null,
        });
        await colaborador.save();
        const colaboradorFinal = { 
            _id: colaborador._id, 
            cedula: colaborador.cedula, 
            nombre: colaborador.nombre,
            correo: colaborador.correo,
            departamento: colaborador.departamento.nombre,
            telefono: colaborador.telefono,
            proyecto: colaborador.proyecto,
            admin: colaborador.admin
        }
        return res.status(201).json({ message: "Se ha creado el colaborador con exito", colaboradorFinal});
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido crear el colaborador: ${error}`});
    }
}

export const logearColaborador:RequestHandler = async (req: Request, res: Response) => {
    const { correo, contrasena } = req.body;
    try {
        const colaborador = await ColaboradorModel.findOne({ correo }).populate("proyecto").populate("departamento");
        if (!colaborador || !colaborador.validarContrasena) throw Error("Login Error")
        colaborador.validarContrasena(contrasena, (err, esValida) => {
            if (err || !esValida) {
                return res.status(400).json({ message: `Error: No se ha podido iniciar sesion` });
            }  else {
                const colaboradorFinal = { 
                    _id: colaborador._id, 
                    cedula: colaborador.cedula, 
                    nombre: colaborador.nombre,
                    correo: colaborador.correo,
                    departamento: colaborador.departamento.nombre,
                    telefono: colaborador.telefono,
                    proyecto: colaborador.proyecto,
                    admin: colaborador.admin
                }
                return res.status(200).json({ message: "Se ha iniciado sesion con exito", colaboradorFinal })
            }
        })
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido iniciar sesion` });
    }
}

export const modificarColaborador:RequestHandler = async (req:Request, res: Response) => {
    const { cedula, correo, telefono, nuevaContrasena, contrasena } = req.body;
    
    const colaborador = await ColaboradorModel.findOne({ cedula });

    if (!colaborador) return res.status(400).json({ message: `Error: No se ha podido modificar el colaborador` });

    try {
        if (nuevaContrasena != "") {
            if (!colaborador.validarContrasena) return res.status(400).json({ message: `Error: No se ha podido modificar el colaborador` });
            colaborador.validarContrasena(contrasena, async (err, esValida) => {
                if (err || !esValida) {
                    return res.status(400).json({ message: `Error: No se ha podido iniciar sesion` });
                } else {
                    const colaboradorEditado = await ColaboradorModel.findByIdAndUpdate(
                        colaborador._id, 
                        { correo, telefono, contrasena },
                        { new: true }).populate("departamento");
                    if (!colaboradorEditado) return res.status(200).json({ message: "Se ha editado al colaborador" });
                    const colaboradorFinal = { 
                        _id: colaboradorEditado._id, 
                        cedula: colaboradorEditado.cedula, 
                        nombre: colaboradorEditado.nombre,
                        correo: colaboradorEditado.correo,
                        departamento: colaboradorEditado.departamento.nombre,
                        telefono: colaboradorEditado.telefono,
                        proyecto: colaboradorEditado.proyecto,
                        admin: colaboradorEditado.admin
                    }
                    return res.status(200).json({ message: "Se ha editado al colaborador", colaboradorFinal });
                }  
            });
        } else {
            const colaboradorEditado = await ColaboradorModel.findByIdAndUpdate(
                colaborador._id, 
                { correo, telefono },
                { new: true }).populate("departamento");
            if (!colaboradorEditado) return res.status(200).json({ message: "Se ha editado al colaborador" });
            const colaboradorFinal = { 
                _id: colaboradorEditado._id, 
                cedula: colaboradorEditado.cedula, 
                nombre: colaboradorEditado.nombre,
                correo: colaboradorEditado.correo,
                departamento: colaboradorEditado.departamento.nombre,
                telefono: colaboradorEditado.telefono,
                proyecto: colaboradorEditado.proyecto,
                admin: colaboradorEditado.admin
            }
            return res.status(200).json({ message: "Se ha editado al colaborador", colaboradorFinal });
        }
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido modificar el colaborador` });
    }
}