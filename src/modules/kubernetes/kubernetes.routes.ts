import { FastifyInstance } from "fastify";
import { deleteNginx, deployNginx } from "./kubernetes.service";
import {
  parseDeleteDeploymentRequest,
  parseDeploymentRequest,
} from "./kubernetes.schema";

export async function kubernetesRoutes(app: FastifyInstance) {
  app.post("/deploy", async (request) => {
    const { name, namespace, replicas } = parseDeploymentRequest(request.body);

    return await deployNginx({
      name,
      namespace,
      replicas,
    });
  });

  app.delete("/deploy", async (request) => {
    const { name, namespace } = parseDeleteDeploymentRequest(request.body);

    return await deleteNginx({ name, namespace });
  });
}
