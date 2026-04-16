import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const handleAppError = (
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      code: error.code,
      message: error.message,
      status: error.statusCode,
    });
  }

  console.error(error);

  return reply.status(500).send({
    code: "INTERNAL_ERROR",
    message: "Something went wrong",
    status: 500,
  });
};
