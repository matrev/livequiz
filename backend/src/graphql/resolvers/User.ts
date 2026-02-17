import { Resolvers, User } from '../../../generated/graphql.js';
import { PrismaContext } from '../../prisma.js';
// import { DateTimeResolver } from 'graphql-scalars';

const UserResolvers: Resolvers = {
    // DateTime: DateTimeResolver,
    Query: {
        getAllUsers(_: any, __: any, context: PrismaContext) {
            return context.prisma.user.findMany() as Promise<User[]>;
        },
        getUser(_: any, args: { id: number }, context: PrismaContext) {
            const { id } = args;
            return context.prisma.user.findUnique({
                where: {
                    id,
                },
            }) as unknown as User | null;
        },
        getUserByEmail(_: any, args: { email: string }, context: PrismaContext) {
            const { email } = args;
            return context.prisma.user.findUnique({
                where: {
                    email,
                },
            }) as unknown as User | null;
        },
    },
    Mutation: {
        async createUser(_: any, args: { name: string; email: string, isAdmin?: boolean }, context: PrismaContext) {
            const { name, email, isAdmin = false} = args;
            const newUser: User = await context.prisma.user.create({
                data: {
                    name,
                    email,
                    isAdmin
                },
            });
            return newUser;
        },
        async deleteUser(_: any, args: { id: number }, context: PrismaContext) {
            const { id } = args;
            const deletedUser: User = await context.prisma.user.delete({
                where: {
                    id,
                },
            });
            return deletedUser;
        },
        async updateUser(_: any, args: { id: number; name?: string; email?: string, isAdmin?: boolean }, context: PrismaContext) { 
            const { id, name, email, isAdmin } = args;
            const updatedUser: User = await context.prisma.user.update({
                where: {
                    id,
                },
                data: {
                    name,
                    email,
                    isAdmin,
                },
            });
            return updatedUser;
        }
    }
}

export { UserResolvers };