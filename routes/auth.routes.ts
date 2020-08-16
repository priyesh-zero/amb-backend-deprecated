import { Router, Response, Request } from "express";
import { IRouter } from "../_interface/Router";
import { ResponseHandler } from "../_base/Response";

export class AuthRouter extends ResponseHandler implements IRouter {
    router: Router;
    constructor() {
        super();
        this.router = Router();
        this.login = this.login.bind(this);
        this.addRoutes();
    }

    addRoutes() {
        /**
         * @swagger
         *
         * /api/auth/login:
         *   post:
         *     description: Login to the application
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: username
         *         description: Username to use for login.
         *         in: formData
         *         required: true
         *         type: string
         *       - name: password
         *         description: User's password.
         *         in: formData
         *         required: true
         *         type: string
         *     responses:
         *       200:
         *         description: successful login if data.success = true and invalid credentials if data.success = false
         *       500:
         *          description: if error occurs while the auth process then with err.message in data.message 500 response is sent
         */
        this.router.post("/login", this.login);
    }

    login(_request: Request, response: Response) {
        try {
            const { username, password } = _request.body;
            if (username === "username" && password === "password") {
                this._response = {
                    status: true,
                    data: {
                        success: true,
                        message: "Logged In Successfully"
                    }
                };
            } else {
                this._response = {
                    status: true,
                    data: {
                        success: false,
                        message: "Invalid credentials"
                    }
                };
            }

            this.respondWithSuccess(response, 200, this._response);
        } catch (err) {
            this._response = {
                status: false,
                error: err.message
            };
            this.respondWithError(response, 500, this._response);
        }
    }

    getRouter() {
        return this.router;
    }
}
