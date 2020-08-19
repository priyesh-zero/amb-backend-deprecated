import { PrismaClient } from "@prisma/client";
export class Prisma {
    prismaClient: PrismaClient;

    constructor() {
        this.prismaClient = new PrismaClient();
    }

    getUserModel() {
        return this.prismaClient.user;
    }
}
