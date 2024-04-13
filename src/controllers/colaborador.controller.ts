import { Request, Response, RequestHandler } from "express";

import { DepartamentoModel } from "../models/departamento.model";
import { ColaboradorModel } from "../models/colaborador.model";
import { ProyectoModel } from "../models/proyecto.model";
import { genSalt, hash } from "bcrypt";

const formatearColaborador = (colaborador:any) => {
    if (colaborador.proyecto && colaborador.proyecto._id) {
        const proyecto = {
            _id: colaborador.proyecto._id,
            nombre: colaborador.proyecto.nombre,
            presupuesto: colaborador.proyecto.presupuesto,
            descripcion: colaborador.proyecto.descripcion,
            fechaInicio: colaborador.proyecto.fechaInicio,
            estado: colaborador.proyecto.estado,
            responsable: (colaborador.proyecto.responsable && colaborador.proyecto.responsable.correo) ? colaborador.proyecto.responsable.correo : colaborador.proyecto.responsable,
            reuniones: colaborador.proyecto.reuniones,
            tareas: colaborador.proyecto.tareas,
            cambios: colaborador.proyecto.cambios,
            recursos: colaborador.proyecto.recursos,
            fechaFin: colaborador.proyecto.fechaFinal
        }
        const colab = { 
            cedula: colaborador.cedula, 
            nombre: colaborador.nombre,
            correo: colaborador.correo,
            departamento: colaborador.departamento,
            telefono: colaborador.telefono,
            proyecto,
            admin: colaborador.admin
        }
        return colab
    }
    const colab = { 
        cedula: colaborador.cedula, 
        nombre: colaborador.nombre,
        correo: colaborador.correo,
        departamento: colaborador.departamento,
        telefono: colaborador.telefono,
        proyecto: colaborador.proyecto,
        admin: colaborador.admin
    }
    return colab
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
        if (colaborador.proyecto) { await colaborador.populate("proyecto.responsable") }
        const colaboradorFinal = formatearColaborador(colaborador);
        return res.status(201).json({ message: "Collaborator successfully created", colaboradorFinal});
    } catch (error:any) {
        if (error.code === 11000) return res.status(400).json({ message: `Error: ${correo} or ${cedula} are already registered as other collaborators email or id`});
        else return res.status(400).json({ message: `Error: Collaborator could not be created: ${error}`});
    }
}

export const logearColaborador:RequestHandler = async (req: Request, res: Response) => {
    const { correo, contrasena } = req.body;
    try {
        const colaborador = await ColaboradorModel.findOne({ correo }).populate("proyecto")
        if (!colaborador || !colaborador.validarContrasena) throw Error("Login Error")
        if (colaborador.proyecto) { await colaborador.populate("proyecto.responsable") }
        colaborador.validarContrasena(contrasena, (err, esValida) => {
            if (err || !esValida) {
                return res.status(400).json({ message: `Error: Failed to log in` });
            }  else {
                const colaboradorFinal = formatearColaborador(colaborador);
                return res.status(200).json({ message: "The session has been successfully logged in", colaboradorFinal })
            }
        })
    } catch (error) {
        return res.status(400).json({ message: `Error: Failed to log in: ${error}` });
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
        if (nuevaContrasena && nuevaContrasena !== "") {
            const salt = await genSalt(8);
            const hashGenerado = await hash(nuevaContrasena, salt);
            if (!colaborador.validarContrasena) return res.status(400).json({ message: `Error: The collaborator could not be modified` });
            colaborador.validarContrasena(contrasena, async (err, esValida) => {
                if (err || !esValida) {
                    return res.status(400).json({ message: `Error: Failed to log in` });
                } else {
                    const cambioObj = Object.fromEntries(Object.entries({ correo, departamento, telefono, contrasena: hashGenerado }).filter(([_, value]) => value !== undefined).filter(([_, value]) => value !== null).filter(([_, value]) => value !== ""))
                    const colaboradorEditado = await ColaboradorModel.findByIdAndUpdate(
                        colaborador._id, 
                        cambioObj,
                        { new: true })
                    if (!colaboradorEditado) return res.status(200).json({ message: "The collaborator couldn't be updated" });
                    const colaboradorFinal = formatearColaborador(colaborador)
                    return res.status(200).json({ message: "The collaborator has been edited successfully", colaboradorFinal });
                }  
            });
        } else {
            const cambioObj = Object.fromEntries(Object.entries({ correo, departamento, telefono }).filter(([_, value]) => value !== undefined).filter(([_, value]) => value !== null).filter(([_, value]) => value !== ""))
            const colaboradorEditado = await ColaboradorModel.findByIdAndUpdate(
                colaborador._id, 
                cambioObj,
                { new: true })
            if (!colaboradorEditado) return res.status(400).json({ message: "The collaborator has been edited successfully" });
            const colaboradorFinal = formatearColaborador(colaborador)
            return res.status(200).json({ message: "The collaborator has been edited successfully", colaboradorFinal });
        }
    } catch (error:any) {
        if (error.code === 11000) return res.status(400).json({ message: `Error: ${correo} is already registered as other collaborators email`});
        else return res.status(400).json({ message: `Error: The collaborator could not be modified: ${error}` });
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
    
    const salt = await genSalt(8);
    const hashGenerado = await hash((contrasena ? contrasena : "aa"), salt);
    
    const proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
    try {
        const cambioObj = Object.fromEntries(Object.entries({ correo, departamento, telefono, contrasena: (contrasena ? hashGenerado : undefined), proyecto }).filter(([_, value]) => value !== undefined).filter(([_, value]) => value !== null).filter(([_, value]) => value !== ""))
        const colaboradorEditado = await ColaboradorModel.findByIdAndUpdate(
            colaborador._id, 
            { ...cambioObj }
        )
        if (!colaboradorEditado) return res.status(400).json({ message: "Error: Couldn't update collaborator" });
        const colaboradorFinal = formatearColaborador(colaborador)
        return res.status(200).json({ message: "The collaborator has been updated!", colaboradorFinal });
        
    } catch (error:any) {
        if (error.code === 11000) return res.status(400).json({ message: `Error: ${correo} is already registered as other collaborators email`});
        else return res.status(400).json({ message: `Error: Couldn't update collaborator: ${error}` });
    }
}

export const asignarProyecto: RequestHandler = async (req:Request, res: Response) => {
    const cedula = req.params.cedula

    const { correo, contrasena, nombreProyecto } = req.body

    const colaborador = await ColaboradorModel.findOne({ cedula });

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
                let proyecto = await ProyectoModel.findOne({ nombre: nombreProyecto });
                if (!proyecto || proyecto.nombre !== "Free") {
                    return res.status(400).json({ message: "Error: Couldn't find project" })
                }
                colaborador.proyecto = proyecto
                await colaborador.save()
                if (proyecto) { await colaborador.populate("proyecto.responsable") }
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
    await colaborador.populate("proyecto.responsable")
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

export const getColaboradoresDisponibles: RequestHandler = async (req: Request, res: Response) => {
    const colaboradores = await ColaboradorModel.find({ admin: false, proyecto: null });
    const colaboradoresFormateados = colaboradores.map(colab => formatearColaborador(colab))
    return res.status(200).json(colaboradoresFormateados);
}