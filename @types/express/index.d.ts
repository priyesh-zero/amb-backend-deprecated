import { AccessTokenData } from "_interface/JsonWebToken";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenData;
    }
  }
}
