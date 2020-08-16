import { Response } from "express";
import {SuccessResponse, ErrorResponse} from "../_interface/Response";


export class ResponseHandler {
    _response: SuccessResponse | ErrorResponse;

    constructor() {}

    respondWithSuccess(
        response: Response,
        statusCode = 200,
        responseData: SuccessResponse
    ) {
        this._response = responseData;
        response.status(statusCode).send(this._response);
    }

    respondWithError(
        response: Response,
        statusCode = 500,
        responseData: ErrorResponse
    ) {
        this._response = responseData;
        response.status(statusCode).send(this._response);
    }
}
