import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Final Project API",
            version: "1.0.0",
            description: "REST API documentation",
        },
        servers: [{ url: "/" }],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Paste the token returned by POST /auth/login",
                },
            },
        },
    },
    apis: ["./src/routes/*.ts"],
});
