import { AccessTokenData } from "_interface/JsonWebToken";

export interface UserRequest extends Request {
  user?: null | AccessTokenData;
}
