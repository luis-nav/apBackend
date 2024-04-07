import { Request, Response, RequestHandler } from "express";

import { DepartamentoModel } from "../models/departamento.model";
import { ColaboradorModel } from "../models/colaborador.model";
import { ProyectoModel } from "../models/proyecto.model";

const formatearColaborador = (colaborador:any) => {
    return { 
        cedula: colaborador.cedula, 
        nombre: colaborador.nombre,
        correo: colaborador.correo,
        departamento: colaborador.departamento,
        telefono: colaborador.telefono,
        proyecto: colaborador.proyecto,
        admin: colaborador.admin
    }
}

export const registrarColaborador:RequestHandler = async (req: Request, res: Response) => {
    const { cedula, nombre, correo, departamento, telefono, contrasena, nombreProyecto } = req.body;
    const correoRegex = new RegExp(".*@estudiantec\.cr")
    if (!correo || !correoRegex.test(correo) ) { return res.status(400).json({ message: "Error: The email is not valid" }) }
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
        return res.status(201).json({ message: "Collaborator successfully created", colaboradorFinal});
    } catch (error) {
        return res.status(400).json({ message: `Error: Collaborator could not be created: ${error}`});
    }
}

export const logearColaborador:RequestHandler = async (req: Request, res: Response) => {
    const { correo, contrasena } = req.body;
    try {
        const colaborador = await ColaboradorModel.findOne({ correo }).populate("proyecto").populate("proyecto.responsable");
        if (!colaborador || !colaborador.validarContrasena) throw Error("Login Error")
        colaborador.proyecto.responsable = colaborador.proyecto.responsable.correo
        colaborador.validarContrasena(contrasena, (err, esValida) => {
            if (err || !esValida) {
                return res.status(400).json({ message: `Error: Failed to log in` });
            }  else {
                const colaboradorFinal = formatearColaborador(colaborador);
                return res.status(200).json({ message: "The session has been successfully logged in", colaboradorFinal })
            }
        })
    } catch (error) {
        return res.status(400).json({ message: `Error: Failed to log in` });
    }
}

export const modificarColaborador:RequestHandler = async (req:Request, res: Response) => {
    const cedula = req.params.cedula
    const { correo, departamento, telefono, nuevaContrasena, contrasena } = req.body;

    const correoRegex = new RegExp(".*@estudiantec\.cr")

    if (correo && !correoRegex.test(correo)) { return res.status(400).json({ message: "Error: The email is not valid" }) }
    
    const colaborador = await ColaboradorModel.findOne({ cedula });

    if (!colaborador) return res.status(400).json({ message: `Error: The collaborator could not be modified` });

    try {
        if (nuevaContrasena != "") {
            if (!colaborador.validarContrasena) return res.status(400).json({ message: `Error: The collaborator could not be modified` });
            colaborador.validarContrasena(contrasena, async (err, esValida) => {
                if (err || !esValida) {
                    return res.status(400).json({ message: `Error: Failed to log in` });
                } else {
                    const cambioObj = Object.fromEntries(Object.entries({ correo, departamento, telefono, contrasena }).filter(([_, value]) => value !== undefined))
                    const colaboradorEditado = await ColaboradorModel.findByIdAndUpdate(
                        colaborador._id, 
                        cambioObj,
                        { new: true }).populate("proyecto");
                    if (!colaboradorEditado) return res.status(200).json({ message: "The collaborator couldn't be updated" });
                    await colaboradorEditado.save()
                    const colaboradorFinal = formatearColaborador(colaborador)
                    return res.status(200).json({ message: "The collaborator has been edited successfully", colaboradorFinal });
                }  
            });
        } else {
            const cambioObj = Object.fromEntries(Object.entries({ correo, departamento, telefono }).filter(([_, value]) => value !== undefined))
            const colaboradorEditado = await ColaboradorModel.findByIdAndUpdate(
                colaborador._id, 
                cambioObj,
                { new: true }).populate("proyecto");
            if (!colaboradorEditado) return res.status(400).json({ message: "The collaborator has been edited successfully" });
            const colaboradorFinal = formatearColaborador(colaborador)
            return res.status(200).json({ message: "The collaborator has been edited successfully", colaboradorFinal });
        }
    } catch (error) {
        return res.status(400).json({ message: `Error: The collaborator could not be modified` });
    }
}

export const modificarColaboradorAdmin:RequestHandler = async (req:Request, res: Response) => {
    const cedula = req.params.cedula
    const { correo, departamento, telefono, contrasena, nombreProyecto } = req.body;

    const correoRegex = new RegExp(".*@estudiantec\.cr")

    if (correo && !correoRegex.test(correo)) { return res.status(400).json({ message: "Error: The email is not valid" }) }
    
    const colaborador = await ColaboradorModel.findOne({ cedula });

    if (!colaborador) return res.status(404).json({ message: `Error: Couldn't find collaborator` });

    if (nombreProyecto && nombreProyecto !== "") {
        const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
        if (!proyecto) return res.status(404).json({ message: `Error: Couldn't find project ${nombreProyecto}`});
    }
    
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
    try {
        const cambioObj = Object.fromEntries(Object.entries({ correo, departamento, telefono, contrasena, proyecto }).filter(([_, value]) => value !== undefined))
        const colaboradorEditado = await ColaboradorModel.findByIdAndUpdate(
            colaborador._id, 
            cambioObj,
            { new: true }).populate("proyecto");
        if (!colaboradorEditado) return res.status(400).json({ message: "Error: Couldn't update collaborator" });
        await colaboradorEditado.save()
        const colaboradorFinal = formatearColaborador(colaborador)
        return res.status(200).json({ message: "The collaborator has been updated!", colaboradorFinal });
        
    } catch (error) {
        return res.status(400).json({ message: `Error: Couldn't update collaborator` });
    }
}

export const asignarProyecto: RequestHandler = async (req:Request, res: Response) => {
    const cedula = req.params.cedula

    const { correo, contrasena, nombreProyecto } = req.body

    const colaborador = await ColaboradorModel.findOne({ cedula }).populate("proyecto");

    if (!colaborador) {
        return res.status(400).json({ message: `Error: Collaborator could not be found` });
    } 

    const admin = await ColaboradorModel.findOne({ correo });
    
    if (!admin || !admin.validarContrasena) {
        return res.status(400).json({ message: `Error: Failed to verify administrator` });
    }
    try {
        admin.validarContrasena(contrasena, async (err, esValida) => {
            if (err || !esValida) {
                return res.status(400).json({ message: `Error: Failed to verify administrator` });
            }  else {
                const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
                if (!proyecto) {
                    return res.status(400).json({ message: "Error: Couldn't find project" })
                }
                colaborador.proyecto = proyecto
                await colaborador.save()
                return res.status(200).json({ message: `${colaborador.nombre} has been assigned to the proyect ${proyecto.nombre}`});
            }
        })
    } catch (error) {
        return res.status(400).json({ message: `Error: The project could not be assigned: ${error}`});   
    }
}

export const getAllColaboradores: RequestHandler = async (req:Request, res: Response) => {
    const colaboradores = await ColaboradorModel.find({ admin: false });
    const colaboradoresFormateados = colaboradores.map(colab => formatearColaborador(colab))
    return res.status(200).json(colaboradoresFormateados);
}

export const getColaborador: RequestHandler = async (req:Request, res: Response) => {
    const cedula = req.params.cedula;
    const colaborador = await ColaboradorModel.findOne({ cedula }).populate("proyecto");
    if (!colaborador) { return res.status(404).json({ message: "Error: Collaborator not found" }) }
    const colaboradorFinal = formatearColaborador(colaborador);
    return res.status(200).json(colaboradorFinal);
}

export const eliminarColaborador: RequestHandler = async (req:Request, res: Response) => {
    const cedula = req.params.cedula;
    const colaborador = await ColaboradorModel.findOne({ cedula });
    if (!colaborador) { return res.status(404).json({ message: `Error: Couldn't find collaborator with id ${cedula}`})}
    const proyectoACargo = await ProyectoModel.findOne({ responsable: colaborador });

    if (proyectoACargo) { return res.status(400).json({ message: `Error: Can't delete collaborator ${colaborador.nombre} because they are responsible for the project ${proyectoACargo.nombre}` })}

    try {
        const eliminacion = await ColaboradorModel.findOneAndDelete({ cedula });
        return res.status(200).json({ message: `${colaborador.nombre} has been eliminated from the system!`})
    } catch (error) {
        return res.status(400).json({ message: `Error: Couldn't delete collaborator with id ${cedula}` })
    }
}