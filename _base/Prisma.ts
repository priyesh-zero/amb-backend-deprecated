import { PrismaClient } from "@prisma/client";
class Prisma {
    prismaClient: PrismaClient;
    constructor() {
        this.prismaClient = new PrismaClient();
    }
}

export default new Prisma();
