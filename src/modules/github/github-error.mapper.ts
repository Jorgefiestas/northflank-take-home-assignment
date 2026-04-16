import { AppError } from "../../shared/error/app-error";
import { ERROR_CODES } from "../../shared/error/error-codes";

export function mapGithubError(error: any): AppError {
  if (error?.status === 401) {
    return new AppError(
      "Invalid GitHub token",
      401,
      ERROR_CODES.GITHUB_AUTH_FAILED,
    );
  }

  if (error?.status === 404) {
    return new AppError(
      "Resource not found on GitHub",
      404,
      ERROR_CODES.NOT_FOUND,
    );
  }

  return new AppError(
    "GitHub request failed",
    502,
    ERROR_CODES.GITHUB_FETCH_FAILED,
  );
}
