import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error!";
  let errorDetails = err;

  // PrismaClientValidationError
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "Invalid data provided. Missing or incorrect field types.";
  }
  //   PrismaClientKnownRequestError
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2001":
      case "P2025":
        statusCode = 404;
        errorMessage = "Requested record was not found.";
        break;

      case "P2002":
        statusCode = 409;
        errorMessage = "Duplicate entry. Unique constraint failed.";
        break;

      case "P2003":
      case "P2014":
        statusCode = 400;
        errorMessage = "Invalid relation or foreign key constraint.";
        break;

      case "P2011":
      case "P2012":
      case "P2013":
        statusCode = 400;
        errorMessage = "Missing required field.";
        break;

      case "P1012":
        statusCode = 400;
        errorMessage = "Invalid Prisma schema configuration.";
        break;

      default:
        statusCode = 500;
        errorMessage = "Database request failed.";
        break;
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Unexpected database error occurred.";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    errorMessage = "Database service unavailable.";

    switch (err.errorCode) {
      case "P1000":
        statusCode = 401;
        errorMessage = "Invalid database credentials.";
        break;

      case "P1001":
      case "P1002":
        statusCode = 503;
        errorMessage = "Cannot connect to the database server.";
        break;

      case "P1010":
        statusCode = 403;
        errorMessage = "Database access denied.";
        break;

      default:
        break;
    }
  }

  res.status(statusCode);
  res.json({
    message: errorMessage,
    errorDetails,
  });
}

export default errorHandler;
