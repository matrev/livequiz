import { gql, TypedDocumentNode } from "@apollo/client";
import {
  GetEntriesForUserQuery,
  GetEntriesForUserQueryVariables,
  GetEntryForUserQuery,
  GetEntryForUserQueryVariables,
} from "@/generated/types";

type GetAllEntriesQuery = {
  getAllEntries: Array<{
    id?: number | null;
    name: string;
    quizId: number;
    userId: number;
    answers: Record<string, string> | null;
    updatedAt: string;
  }>;
};

type GetAllEntriesQueryVariables = Record<string, never>;

export const getEntriesForUser: TypedDocumentNode<
  GetEntriesForUserQuery,
  GetEntriesForUserQueryVariables
> = gql`
  query GetEntriesForUser($userId: Int!) {
    getEntriesForUser(userId: $userId) {
      id
      name
      quizId
      userId
      answers
      updatedAt
    }
  }
`;

export const getEntryForUser: TypedDocumentNode<
  GetEntryForUserQuery,
  GetEntryForUserQueryVariables
> = gql`
  query GetEntryForUser($quizId: Int!, $userId: Int!) {
    getEntryForUser(quizId: $quizId, userId: $userId) {
      id
      name
      quizId
      userId
      answers
      updatedAt
    }
  }
`;

export const getAllEntries: TypedDocumentNode<
  GetAllEntriesQuery,
  GetAllEntriesQueryVariables
> = gql`
  query GetAllEntries {
    getAllEntries {
      id
      name
      quizId
      userId
      answers
      updatedAt
    }
  }
`;
