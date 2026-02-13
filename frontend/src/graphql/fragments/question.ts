import { gql } from "@apollo/client";

/**
 * Core question fields without answer information
 */
export const questionCoreFields = gql`
    fragment QuestionCoreFields on Question {
        id
        text
        questionType
    }
`;

/**
 * Question fields including options (for multiple choice questions)
 */
export const questionWithOptionsFields = gql`
    fragment QuestionWithOptionsFields on Question {
        id
        text
        questionType
        options
    }
`;

/**
 * Complete question fields including correct answer
 * Use this for admin/edit views where answers should be visible
 */
export const questionFullFields = gql`
    fragment QuestionFullFields on Question {
        id
        text
        questionType
        options
        correctAnswer
    }
`;
