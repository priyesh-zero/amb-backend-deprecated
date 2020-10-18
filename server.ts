import Express, { Application } from "express";
import { AuthRouter } from "./routes/auth.routes";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJsDocs from "swagger-jsdoc";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ProfileRouter } from "./routes/profile.routes";

class Server {
  app: Application;
  port: String;
  whitelist: String[];
  constructor() {
    this.port = process.env.PORT || "4000";
    this.app = Express();
    this.applyPreMiddleware();
    this.addRoutes();
    this.initServer();
    this.whitelist = [
      "https://musing-mclean-b082b4.netlify.app",
      "https://ambulancia-backend.herokuapp.com",
      "http://localhost:4200",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:4000",
      "https://ambulancia.netlify.app",
    ];
  }

  applyPreMiddleware() {
    // body parser
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    // cookie parser
    this.app.use(cookieParser());
    //cors - only on api route
    this.app.all(
      "/api/**",
      cors({
        origin: (origin, callback) => {
          console.log(origin);
          if (
            (origin && this.whitelist.indexOf(origin) !== -1) ||
            origin === undefined
          ) {
            callback(null, true);
          } else {
            callback(new Error("IP not Allowed by Cors"));
          }
        },
        credentials: true,
      })
    );
  }

  addRoutes() {
    this.app.use("/api/auth", new AuthRouter().getRouter());
    this.app.use("/api/profile", new ProfileRouter().getRouter());
    this.addSwaggerRoute();
  }

  addSwaggerRoute() {
    // swagger api doc generation
    const swaggerOptions = {
      swaggerDefinition: {
        info: {
          title: "Ambulancia Backend API",
          description: "API for a mobile app Ambulancia",
          version: "1.0.0",
          contact: {
            name: "Priyesh Shrivastava",
          },
          servers: [
            "http://127.0.0.1:4000",
            "https://ambulancia-backend.herokuapp.com",
          ],
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
      apis: ["./routes/**.routes.ts", "./routes/**.routes.js"],
    };
    const swaggerDocs = swaggerJsDocs(swaggerOptions);
    this.app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }

  corsMiddleWare() {}

  initServer() {
    this.app.listen(this.port, () => {
      console.log(`Server active on Port : ${this.port}`);
    });
  }
}

new Server();
