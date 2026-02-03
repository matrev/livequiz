import { prisma } from '../../prisma.js';
import { DateTimeResolver } from 'graphql-scalars';

const UserResolvers = {
    DateTime: DateTimeResolver,
    Query: {
        getAllUsers() {
            return prisma.user.findMany();
        }
    },
    Mutation: {
        async createUser(_: any, args: { name: string; email: string }) {
            const { name, email } = args;
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                },
            });
            return newUser;
        },
        async deleteUser(_: any, args: { id: number }) {
            const { id } = args;
            const deletedUser = await prisma.user.delete({
                where: {
                    id,
                },
            });
            return deletedUser;
        },
        async updateUser(_: any, args: { id: number; name?: string; email?: string }) { 
            const { id, name, email } = args;
            const updatedUser = await prisma.user.update({
                where: {
                    id,
                },
                data: {
                    name,
                    email,
                },
            });
            return updatedUser;
        }
    }
}

export { UserResolvers };