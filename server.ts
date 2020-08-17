import Express, { Application } from "express";
import { AuthRouter } from "./routes/auth.routes";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJsDocs from "swagger-jsdoc";

class Server {
    app: Application;
    port: String;
    constructor() {
        this.port = process.env.PORT || "4000";
        this.app = Express();
        this.applyPreMiddleware();
        this.addRoutes();
        this.initServer();
    }

    applyPreMiddleware() {
        // body parser
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    addRoutes() {
        this.app.use("/api/auth", new AuthRouter().getRouter());
        this.addSwaggerRoute();
    }

    addSwaggerRoute() {
        // swagger api doc generation
        const swaggerOptions = {
            swaggerDefinition: {
                info: {
                    title: "Documentation Title",
                    description: "Documentation Description",
                    version: "1.0.0",
                    contact: {
                        name: "Priyesh Shrivastava"
                    },
                    servers: ["http://127.0.0.1:4000", "https://ambulancia-backend.herokuapp.com"]
                }
            },
            apis: ["./routes/**.routes.ts"]
        };
        const swaggerDocs = swaggerJsDocs(swaggerOptions);
        this.app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    }

    initServer() {
        this.app.listen(this.port, () => {
            console.log(`Server active on Port : ${this.port}`);
        });
    }
}

new Server();
