import { Router, Response, Request } from "express";
import { IRouter } from "../_interface/Router";
import { ResponseHandler } from "../_base/Response";
import { Prisma } from "../_base/Prisma";
import { UsersDelegate } from "@prisma/client";
import argon2 from "argon2";
import { JsonWebToken } from "../_base/JsonWebTokens";

export class AuthRouter extends ResponseHandler implements IRouter {
  router: Router;

  userModel: UsersDelegate;

  jwt: JsonWebToken;

  constructor() {
    super();
    this.userModel = new Prisma().getUserModel();
    this.jwt = new JsonWebToken();
    this.router = Router();
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.addRoutes();
  }

  addRoutes() {
    /**
     * @swagger
     *
     * /api/auth/register:
     *   post:
     *     description: Register a user to the application
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: unique email
     *         in: formData
     *         required: true
     *         type: string
     *       - name: firstName
     *         description: firstName of the User
     *         in: formData
     *         required: true
     *         type: string
     *       - name: lastName
     *         description: lastName of the User
     *         in: formData
     *         required: true
     *         type: string
     *       - name: phone
     *         description: phone number of the User
     *         in: formData
     *         required: true
     *         type: string
     *       - name: age
     *         description: phone number of the User
     *         in: formData
     *         required: false
     *         type: number
     *       - name: password
     *         description: User's password.
     *         in: formData
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: User succesfully created
     *       500:
     *          description: if error occurs while the auth process then with err.message in data.message 500 response is sent
     */
    this.router.post("/register", this.register);
    /**
     * @swagger
     *
     * /api/auth/login:
     *   post:
     *     description: Login to the application
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: email to use for login.
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

    /**
     * @swagger
     *
     * /api/auth/refresh-token:
     *   get:
     *     description: Get an access token and return a new refresh token
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: returns an access token if refresh token is valid and refresh the refresh token
     *       500:
     *          description: if error occurs while the auth process then with err.message in data.message 500 response is sent
     */
    this.router.get("/refresh-token", this.refreshToken);
  }

  async login(_request: Request, response: Response) {
    try {
      const { email, password } = _request.body;
      const user = await this.userModel.findOne({
        where: { email },
      });
      if (!user) {
        this._response = {
          status: true,
          data: {
            success: false,
            message: "Invalid credentials",
          },
        };
      } else if (await argon2.verify(user.password, password)) {
        response.cookie(
          "ARC",
          this.jwt.createRefreshToken({
            id: user.id,
            tokenVersion: user.tokenVersion,
          }),
          { httpOnly: true, path: "/api/auth/refresh-token" }
        );
        this._response = {
          status: true,
          data: {
            success: true,
            data: {
              accessToken: this.jwt.createAccessToken({
                id: user.id,
              }),
            },
          },
        };
      } else {
        this._response = {
          status: true,
          data: {
            success: false,
            message: "Invalid credentials",
          },
        };
      }

      this.respondWithSuccess(response, 200, this._response);
    } catch (err) {
      this._response = {
        status: false,
        error: err.message,
      };
      this.respondWithError(response, 500, this._response);
    }
  }

  async register(_request: Request, response: Response) {
    try {
      _request.body.password = await argon2.hash(_request.body.password);
      _request.body.age = parseInt(_request.body.age);
      const user = await this.userModel.create({
        data: {
          ..._request.body,
        },
      });
      this._response = {
        status: true,
        data: {
          user,
        },
      };
      this.respondWithSuccess(response, 200, this._response);
    } catch (e) {
      console.log(e.message);
      this._response = {
        status: false,
        error: e.message,
      };
      this.respondWithError(response, 500, this._response);
    }
  }

  async refreshToken(_request: Request, response: Response) {
    try {
      const tokenData = this.jwt.verifyRefreshToken(_request.cookies.ARC);
      if (!tokenData) {
        response.cookie("ARC", "", {
          httpOnly: true,
          path: "/api/auth/refresh-token",
        });
        this._response = {
          status: true,
          data: {
            accessToken: null,
          },
          message: "Your Session has expired",
        };
      } else {
        const user = await this.userModel.findOne({
          where: { id: tokenData.id },
        });
        if (user && user.tokenVersion === tokenData.tokenVersion) {
          response.cookie(
            "ARC",
            this.jwt.createRefreshToken({
              id: user.id,
              tokenVersion: user.tokenVersion,
            }),
            { httpOnly: true, path: "/api/auth/refresh-token" }
          );
          this._response = {
            status: true,
            data: {
              accessToken: this.jwt.createAccessToken({
                id: -1,
              }),
            },
          };
        } else {
          response.cookie("ARC", "", {
            httpOnly: true,
            path: "/api/auth/refresh-token",
          });
          this._response = {
            status: true,
            data: {
              accessToken: null,
            },
            message: "Your Session has expired",
          };
        }
      }

      this.respondWithSuccess(response, 200, this._response);
    } catch (err) {
      this._response = {
        status: false,
        error: err.message,
      };
      this.respondWithError(response, 500, this._response);
    }
  }

  getRouter() {
    return this.router;
  }
}
