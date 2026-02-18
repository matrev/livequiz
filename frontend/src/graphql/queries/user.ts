import { gql, TypedDocumentNode } from "@apollo/client";
import {
  GetAllUsersQuery,
  GetAllUsersQueryVariables,
  GetUserByEmailQuery,
  GetUserByEmailQueryVariables,
} from "@/generated/types";

export const getAllUsers: TypedDocumentNode<
  GetAllUsersQuery,
  GetAllUsersQueryVariables
> = gql`
  query GetAllUsers {
    getAllUsers {
      id
      name
      email
      isAdmin
    }
  }
`;

export const getUserByEmail: TypedDocumentNode<
  GetUserByEmailQuery,
  GetUserByEmailQueryVariables
> = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
      name
      email
    }
  }
`;
