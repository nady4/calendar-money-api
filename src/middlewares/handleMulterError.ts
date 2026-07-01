import { NextFunction, Request, Response } from "express";
import multer from "multer";

const handleMulterError = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: "Image too large. Limit is 10 MB.",
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }
  if (err instanceof Error) {
    if (err.message.startsWith("Unsupported file type")) {
      return res.status(415).json({
        success: false,
        error: err.message,
      });
    }
  }
  next(err);
};

export default handleMulterError;
