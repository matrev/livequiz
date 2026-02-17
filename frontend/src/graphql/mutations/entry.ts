import { gql, TypedDocumentNode } from "@apollo/client";
import { UpsertEntryMutation, UpsertEntryMutationVariables } from "@/generated/types";

export const upsertEntry: TypedDocumentNode<
  UpsertEntryMutation,
  UpsertEntryMutationVariables
> = gql`
  mutation UpsertEntry($quizId: Int!, $name: String!, $answers: JSON!, $userId: Int) {
    upsertEntry(quizId: $quizId, name: $name, answers: $answers, userId: $userId) {
      id
      name
      quizId
      userId
      answers
      updatedAt
    }
  }
`;