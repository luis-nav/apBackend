import { Request, Response, RequestHandler } from "express";

import { DepartamentoModel } from "../models/departamento.model";
import { ColaboradorModel } from "../models/colaborador.model";
import { ProyectoModel } from "../models/proyecto.model";

const formatearColaborador = (colaborador:any) => {
    return { 
        cedula: colaborador.cedula, 
        nombre: colaborador.nombre,
        correo: colaborador.correo,
        departamento: colaborador.departamento.nombre,
        telefono: colaborador.telefono,
        proyecto: colaborador.proyecto,
        admin: colaborador.admin
    }
}

export const registrarColaborador:RequestHandler = async (req: Request, res: Response) => {
    const { cedula, nombre, correo, nombreDepartamento, telefono, contrasena, nombreProyecto } = req.body;
    const correoRegex = new RegExp(".*@estudiantec\.cr")
    if (!correo || !correoRegex.test(correo) ) return res.status(400).json({ message: "Error: El correo no es valido" })
    const departamento = await DepartamentoModel.findOne({ nombre: nombreDepartamento });
    if (!departamento) return res.status(400).json({ message: "Error: Departamento Invalido" })
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
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
        const colaboradorFinal = formatearColaborador(colaborador);
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
                const colaboradorFinal = formatearColaborador(colaborador);
                return res.status(200).json({ message: "Se ha iniciado sesion con exito", colaboradorFinal })
            }
        })
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido iniciar sesion` });
    }
}

export const modificarColaborador:RequestHandler = async (req:Request, res: Response) => {
    const cedula = req.params.cedula
    const { correo, telefono, nuevaContrasena, contrasena } = req.body;
    
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
                        { new: true }).populate("proyecto").populate("departamento");
                    if (!colaboradorEditado) return res.status(200).json({ message: "Se ha editado al colaborador" });
                    const colaboradorFinal = formatearColaborador(colaborador)
                    return res.status(200).json({ message: "Se ha editado al colaborador", colaboradorFinal });
                }  
            });
        } else {
            const colaboradorEditado = await ColaboradorModel.findByIdAndUpdate(
                colaborador._id, 
                { correo, telefono },
                { new: true }).populate("proyecto").populate("departamento");
            if (!colaboradorEditado) return res.status(200).json({ message: "Se ha editado al colaborador" });
            const colaboradorFinal = formatearColaborador(colaborador)
            return res.status(200).json({ message: "Se ha editado al colaborador", colaboradorFinal });
        }
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido modificar el colaborador` });
    }
}

export const asignarProyecto: RequestHandler = async (req:Request, res: Response) => {
    const cedula = req.params.cedula

    const { correo, contrasena, nombreProyecto } = req.body

    const colaborador = await ColaboradorModel.findOne({ cedula }).populate("proyecto").populate("departamento");

    if (!colaborador) {
        return res.status(400).json({ message: `Error: No se ha podido encontrar al colaborador` });
    } 

    const admin = await ColaboradorModel.findOne({ correo });
    
    if (!admin || !admin.validarContrasena) {
        return res.status(400).json({ message: `Error: No se ha podido verificar el administrador` });
    }
    try {
        admin.validarContrasena(contrasena, async (err, esValida) => {
            if (err || !esValida) {
                return res.status(400).json({ message: `Error: No se ha podido verificar el administrador` });
            }  else {
                const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
                if (!proyecto) {
                    return res.status(400).json({ message: "Error: No se ha encontrado el proyecto" })
                }
                colaborador.proyecto = proyecto
                await colaborador.save()
                return res.status(200).json({ message: `Se ha asignado a ${colaborador.nombre} al proyecto ${proyecto.nombre}`});
            }
        })
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido asignar el proyecto: ${error}`});   
    }
}

export const asignarDepartamento: RequestHandler = async (req:Request, res: Response) => {
    const cedula = req.params.cedula

    const { correo, contrasena, nombreDepartamento } = req.body

    const colaborador = await ColaboradorModel.findOne({ cedula }).populate("proyecto").populate("departamento");

    if (!colaborador) {
        return res.status(400).json({ message: `Error: No se ha podido encontrar al colaborador` });
    } 

    const admin = await ColaboradorModel.findOne({ correo });
    
    if (!admin || !admin.validarContrasena) {
        return res.status(400).json({ message: `Error: No se ha podido verificar el administrador` });
    }
    try {
        admin.validarContrasena(contrasena, async (err, esValida) => {
            if (err || !esValida) {
                return res.status(400).json({ message: `Error: No se ha podido verificar el administrador` });
            }  else {
                const departamento = await DepartamentoModel.findOne({ nombre: nombreDepartamento });
                if (!departamento) {
                    return res.status(400).json({ message: "Error: No se ha encontrado el departamento" })
                }
                colaborador.departamento = departamento
                await colaborador.save()
                return res.status(200).json({ message: `Se ha asignado a ${colaborador.nombre} al departamento de ${departamento.nombre}`});
            }
        })
    } catch (error) {
        return res.status(400).json({ message: `Error: No se ha podido asignar al departamento: ${error}`});   
    }
}

export const getAllColaboradores: RequestHandler = async (req:Request, res: Response) => {
    const colaboradores = await ColaboradorModel.find({});
    const colaboradoresFormateados = colaboradores.map(colab => formatearColaborador(colab))
    return res.status(200).json(colaboradoresFormateados);
}

export const getColaborador: RequestHandler = async (req:Request, res: Response) => {
    const cedula = req.params.cedula;
    const colaborador = await ColaboradorModel.findOne({ cedula });
    if (!colaborador) { return res.status(404).json({ message: "Error: No se ha encontrado al colaborador" }) }
    const colaboradorFinal = formatearColaborador(colaborador);
    return res.status(200).json(colaboradorFinal);
}