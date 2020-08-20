import { sign, SignOptions, Secret, verify } from "jsonwebtoken";
import { AccessTokenData, RefreshTokenData } from "../_interface/JsonWebToken";

export class JsonWebToken {
    _accessTokenSecret: Secret;

    _refreshTokenSecret: Secret;

    _accessTokenOptions: SignOptions;

    _refreshTokenOptions: SignOptions;

    constructor() {
        this._accessTokenSecret =
            process.env.ACCESS_TOKEN || "Local Secret Access";

        this._refreshTokenSecret =
            process.env.REFRESH_TOKEN || "Local Secret Refresh";

        this._accessTokenOptions = {
            expiresIn: "1h"
        };

        this._refreshTokenOptions = {
            expiresIn: "7d"
        };
    }

    createAccessToken(payload: AccessTokenData) {
        return sign(payload, this._accessTokenSecret, this._accessTokenOptions);
    }

    verifyAccessToken(token: string): AccessTokenData | null {
        return verify(token, this._accessTokenSecret) as AccessTokenData;
    }

    createRefreshToken(payload: RefreshTokenData) {
        return sign(
            payload,
            this._refreshTokenSecret,
            this._refreshTokenOptions
        );
    }

    verifyRefreshToken(token: string): RefreshTokenData | null {
        return verify(token, this._refreshTokenSecret) as RefreshTokenData;
    }
}
