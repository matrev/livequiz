import { gql, TypedDocumentNode } from "@apollo/client";
import { MutationCreateQuizArgs, Quiz } from "@/generated/types";

export const createQuiz: TypedDocumentNode<Quiz, MutationCreateQuizArgs> = gql`
    mutation CreateQuiz($title: String!, $questions: [QuestionInput]) {
        createQuiz(title: $title, questions: $questions) {
            title
            questions {
                options
                correctAnswer
                text
                questionType
            }
        }
    }
`;
