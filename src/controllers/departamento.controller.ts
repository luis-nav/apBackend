import { Request, RequestHandler, Response } from "express";
import { DepartamentoModel } from "../models/departamento.model";

export const getDepartamentos: RequestHandler = async (req: Request, res: Response) => {
    const departamentos = await DepartamentoModel.find({}).lean().exec();
    return res.status(200).json(departamentos);
}