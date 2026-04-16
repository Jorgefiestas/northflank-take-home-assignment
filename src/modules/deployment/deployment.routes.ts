import { FastifyInstance } from "fastify";
import { deployFromGithub } from "./deployment.service";
import { parseDeployFromGithubRequest } from "./deployment.schema";

export async function deploymentRoutes(app: FastifyInstance) {
  app.post("/from-github", async (request) => {
    const { owner, repo, branch, path } = parseDeployFromGithubRequest(
      request.body,
    );
    return await deployFromGithub(owner, repo, branch, path);
  });
}
