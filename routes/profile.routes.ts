import { Router, Response, Request } from "express";
import { IRouter } from "../_interface/Router";
import { ResponseHandler } from "../_base/Response";
import { Prisma } from "../_base/Prisma";
import { UsersDelegate } from "@prisma/client";
import { authMiddleWare } from "../middlewares/AuthMiddleWare";
import * as yup from "yup";

export class ProfileRouter extends ResponseHandler implements IRouter {
  router: Router;

  userModel: UsersDelegate;

  constructor() {
    super();
    this.userModel = new Prisma().getUserModel();
    this.router = Router();
    this.me = this.me.bind(this);
    this.updateMe = this.updateMe.bind(this);
    this.addRoutes();
  }
  getRouter() {
    return this.router;
  }

  addRoutes() {
    /**
     * @swagger
     *
     * /api/profile/me:
     *   get:
     *     description: Get the user Info of the current logged in User
     *     produces:
     *       - application/json
     *     security:
     *         - Bearer: []
     *     responses:
     *       200:
     *         description: User Info Successfully Returned
     *       401:
     *          description: Token Authorization Failed
     *       500:
     *          description: Server Error
     */
    this.router.get("/me", authMiddleWare, this.me);
    /**
     * @swagger
     *
     * /api/profile/me:
     *   put:
     *     description: Update user details
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: unique email
     *         in: formData
     *         required: false
     *         type: string
     *       - name: firstName
     *         description: firstName of the User
     *         in: formData
     *         required: false
     *         type: string
     *       - name: lastName
     *         description: lastName of the User
     *         in: formData
     *         required: false
     *         type: string
     *       - name: phone
     *         description: phone number of the User
     *         in: formData
     *         required: false
     *         type: string
     *       - name: age
     *         description: phone number of the User
     *         in: formData
     *         required: false
     *         type: number
     *     responses:
     *       200:
     *         description: successful login if data.success = true and invalid credentials if data.success = false
     *       500:
     *          description: if error occurs while the auth process then with err.message in data.message 500 response is sent
     */
    // this.router.post("/login", this.login);

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
    this.router.put("/me", authMiddleWare, this.updateMe);
  }

  async me(request: Request, response: Response) {
    try {
      const user = await this.userModel.findOne({
        where: { id: request.user!.id },
      });
      if (!user) {
        return this.respondWithError(response, 500, {
          status: false,
          error: "User Not Found",
        });
      }
      delete user.password;
      delete user.tokenVersion;
      delete user.id;
      return this.respondWithSuccess(response, 200, {
        status: true,
        data: user,
      });
    } catch (err) {
      return this.respondWithError(response, 500, {
        status: false,
        error: err.message,
      });
    }
  }

  async updateMe(request: Request, response: Response) {
    const validationSchema = yup.object().shape({
      email: yup.string().email("Invalid Email Provided!"),
      phone: yup
        .string()
        .length(10, "Phone Numbers should be of 10 digits")
        .matches(
          new RegExp("\\d{10}"),
          "India Only supports Digits in numbers for now"
        ),
      firstName: yup.string().min(3, "Names should be at least 3 characters"),
      lastName: yup.string().min(3, "Names should be at least 3 characters"),
      address: yup.string().min(3, "Can't Have such a short address"),
      age: yup
        .number()
        .positive("Age cannot be negative")
        .min(13, "You should be at least 13 to use this app")
        .max(
          90,
          "If you are older more power to you, but you should really let some one handle this for you. Max age 90"
        ),
    });
    delete request.body.password;
    delete request.body.tokenVersion;
    delete request.body.id;
    try {
      if (Object.keys(request.body).length <= 0) {
        throw new Error("Empty Body sent for update");
      }
      await validationSchema.validate(request.body);

      await this.userModel.update({
        where: { id: request.user!.id },
        data: { ...request.body },
      });
      this.respondWithSuccess(response, 200, {
        status: true,
        data: "Profile Successfully Updated",
      });
    } catch (e) {
      this.respondWithError(response, 500, { status: false, error: e.message });
    }
  }
}
