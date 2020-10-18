import { Request, Response, NextFunction } from "express";
import { JsonWebToken } from "../_base/JsonWebTokens";

const jwt = new JsonWebToken();

export const authMiddleWare = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const bearerToken = request.header("Authorization");
  if (!bearerToken) {
    return response
      .status(401)
      .send({ ok: false, message: "No Bearer Token Provided" });
  }
  const tokenArr = bearerToken.split(" ");
  if (tokenArr.length !== 2 || !tokenArr[1]) {
    return response.status(401).send({
      ok: false,
      message: "Invalid Bearer Token Format ( Bearer xxxxxxx )",
    });
  }
  const token = tokenArr[1];

  try {
    const tokenData = jwt.verifyAccessToken(token);
    if (!tokenData) {
      return response.status(401).send({
        ok: false,
        message: "Token Expired",
      });
    }
    request.user = tokenData;
    return next();
  } catch (err) {
    return response.status(401).send({ ok: false, message: err.message });
  }
};
