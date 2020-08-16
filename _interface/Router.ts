import { Router } from "express";

export interface IRouter {
    router: Router;
    addRoutes: () => void;
    getRouter: () => Router;
}
