import { FastifyInstance } from "fastify";
import {
  listRepos,
  listBranches,
  readYamlFile,
  updateYamlFile,
} from "./github.service";
import {
  parseDeploymentUpdateRequest,
  parseFileQuery,
  parseRepoParams,
} from "./github.schema";

export async function githubRoutes(app: FastifyInstance) {
  app.get("/repos", async () => {
    return await listRepos();
  });

  app.get("/repos/:owner/:repo/branches", async (request) => {
    const { owner, repo } = parseRepoParams(request.params);
    return await listBranches(owner, repo);
  });

  app.get("/repos/:owner/:repo/file", async (request) => {
    const { owner, repo } = parseRepoParams(request.params);
    const { path, branch } = parseFileQuery(request.query);
    const yaml = await readYamlFile(owner, repo, path, branch);
    return {
      name: yaml.name,
      replicas: yaml.replicas,
      annotations: yaml.annotations,
    };
  });

  app.put("/repos/:owner/:repo/file", async (request) => {
    const { owner, repo } = parseRepoParams(request.params);
    const { path, branch } = parseFileQuery(request.query);
    const updates = parseDeploymentUpdateRequest(request.body);
    return await updateYamlFile(owner, repo, path, branch, updates);
  });
}
