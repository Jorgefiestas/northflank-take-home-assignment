import Fastify from "fastify";
import "dotenv/config";

import { githubRoutes } from "./modules/github/github.routes";
import { handleAppError } from "./shared/error/app-error";
import { kubernetesRoutes } from "./modules/kubernetes/kubernetes.routes";
import { deploymentRoutes } from "./modules/deployment/deployment.routes";

const app = Fastify();

app.setErrorHandler(handleAppError);
app.register(githubRoutes, { prefix: "/github" });
app.register(kubernetesRoutes, { prefix: "/kubernetes" });
app.register(deploymentRoutes, { prefix: "/deployments" });

app.get("/health", async () => {
  return { status: "ok" };
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log("Server running on http://localhost:3000");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
