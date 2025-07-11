import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { userTags, userSchemas } from "./user.swagger"; // <-- import user-specific config

// Manual __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    tags: [...userTags], // ✅ Add tags
    components: {
      schemas: {
        ...userSchemas, // ✅ Add schemas
      },
    },
  },
  apis: ["src/routes/**/*.ts", "src/controllers/**/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const outputDir = path.resolve(__dirname, "../docs");
const outputPath = path.join(outputDir, "swagger.json");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), {
  encoding: "utf-8",
});
