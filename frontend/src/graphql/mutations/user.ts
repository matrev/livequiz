import { gql, TypedDocumentNode } from "@apollo/client";
import { CreateUserMutation, MutationCreateUserArgs } from "@/generated/types";

export const createUser: TypedDocumentNode<
  CreateUserMutation,
  MutationCreateUserArgs
> = gql`
  mutation CreateUser($email: String!, $name: String!, $isAdmin: Boolean) {
    createUser(email: $email, name: $name, isAdmin: $isAdmin) {
      id
      name
      email
      isAdmin
    }
  }
`;
