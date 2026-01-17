import type { Request, Response } from "express";

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    message: "No path has been found",
    path: req.path,
  });
}
