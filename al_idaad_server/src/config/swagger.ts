import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Al Idaad API",
    description: "Auto-generated API documentation",
    version: "1.0.0",
  },
  servers: [
    { url: "http://localhost:4000", description: "Local" },
    { url: "https://your-prod-url.com", description: "Production" },
  ],
  // If you use Bearer tokens (JWT):
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const outputFile = "./swagger-output.json";      
const routes   = ["./src/routes/index.ts"];      

swaggerAutogen({ openapi: "3.0.0" })(outputFile, routes, doc);