import swaggerJsdoc from "swagger-jsdoc";
import { env_config } from "./env";
import {userSchemas, userTags} from "../../scripts/user.swagger"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: `http://localhost:${env_config.PORT}`,
      },
    ],
     tags: [...userTags],
    components: {
    schemas: {
      ...userSchemas,
    },
  },
  },
  apis: ["./src/routes/*.ts"], // path to your route files
};

export const swaggerSpec = swaggerJsdoc(options);
