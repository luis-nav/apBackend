import { NextFunction, Request, Response } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization && req.headers.authorization !== '') {
        next();
    } else {
        return res.status(401).json({ message: 'El usuario no esta autenticado' });
    }
}