import { gql, TypedDocumentNode } from "@apollo/client";
import { GetAllUsersQuery, GetAllUsersQueryVariables } from "@/generated/types";

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
