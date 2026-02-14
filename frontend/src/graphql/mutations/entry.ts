import { gql, TypedDocumentNode } from "@apollo/client";
import { UpsertEntryMutation, UpsertEntryMutationVariables } from "@/generated/types";

export const upsertEntry: TypedDocumentNode<
  UpsertEntryMutation,
  UpsertEntryMutationVariables
> = gql`
  mutation UpsertEntry($quizId: Int!, $userId: Int!, $title: String!, $answers: JSON!) {
    upsertEntry(quizId: $quizId, userId: $userId, title: $title, answers: $answers) {
      id
      title
      quizId
      answers
      updatedAt
    }
  }
`;
