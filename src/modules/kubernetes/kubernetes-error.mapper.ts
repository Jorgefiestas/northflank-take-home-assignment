import { AppError } from "../../shared/error/app-error";
import { ERROR_CODES } from "../../shared/error/error-codes";

export function mapKubernetesError(e: any): AppError {
  const status = e?.response?.statusCode;

  switch (status) {
    case 404:
      return new AppError(
        "Resource not found",
        404,
        ERROR_CODES.KUBERNETES_NOT_FOUND,
      );

    case 409:
      return new AppError(
        "Resource already exists",
        409,
        ERROR_CODES.KUBERNETES_CONFLICT,
      );

    case 400:
      return new AppError(
        e?.body?.message || "Invalid Kubernetes request",
        400,
        ERROR_CODES.INVALID_INPUT,
      );

    default:
      return new AppError(
        e?.body?.message || "Kubernetes error",
        500,
        ERROR_CODES.KUBERNETES_ERROR,
      );
  }
}
