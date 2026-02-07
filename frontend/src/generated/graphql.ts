/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Entry = {
  __typename?: 'Entry';
  author: User;
  id: Scalars['Int']['output'];
  quiz: Quiz;
  title: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addQuestionToQuiz: Quiz;
  createQuestion: Question;
  createQuiz: Quiz;
  createUser: User;
  deleteQuestion: Question;
  deleteQuiz: Quiz;
  deleteUser: User;
  removeQuestionFromQuiz: Quiz;
  updateQuestion: Question;
  updateQuiz: Quiz;
  updateUser: User;
};


export type MutationAddQuestionToQuizArgs = {
  questionId: Scalars['Int']['input'];
  quizId: Scalars['Int']['input'];
};


export type MutationCreateQuestionArgs = {
  correctAnswer?: InputMaybe<Scalars['String']['input']>;
  questionType: QuestionType;
  quizId: Scalars['Int']['input'];
  text: Scalars['String']['input'];
};


export type MutationCreateQuizArgs = {
  questions?: InputMaybe<Array<InputMaybe<QuestionInput>>>;
  title: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  isAdmin?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};


export type MutationDeleteQuestionArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteQuizArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRemoveQuestionFromQuizArgs = {
  questionId: Scalars['Int']['input'];
  quizId: Scalars['Int']['input'];
};


export type MutationUpdateQuestionArgs = {
  correctAnswer?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  questionType?: InputMaybe<QuestionType>;
  text?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateQuizArgs = {
  id: Scalars['Int']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateUserArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  getAllQuizzes: Array<Quiz>;
  getAllUsers: Array<User>;
  getQuestion?: Maybe<Question>;
  getQuestionsForQuiz: Array<Question>;
  getQuiz?: Maybe<Quiz>;
  getUser?: Maybe<User>;
  getUsersForQuiz: Array<User>;
  isQuestionCorrect: Scalars['Boolean']['output'];
};


export type QueryGetQuestionArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetQuestionsForQuizArgs = {
  quizId: Scalars['Int']['input'];
};


export type QueryGetQuizArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetUserArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetUsersForQuizArgs = {
  quizId: Scalars['Int']['input'];
};


export type QueryIsQuestionCorrectArgs = {
  answer: Scalars['String']['input'];
  questionId: Scalars['Int']['input'];
};

export type Question = {
  __typename?: 'Question';
  correctAnswer?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  questionType: QuestionType;
  quizId: Scalars['Int']['output'];
  text: Scalars['String']['output'];
};

export type QuestionInput = {
  correctAnswer?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  questionType: QuestionType;
  quizId: Scalars['Int']['input'];
  text: Scalars['String']['input'];
};

export enum QuestionType {
  MultipleChoice = 'MULTIPLE_CHOICE',
  ShortAnswer = 'SHORT_ANSWER',
  TrueFalse = 'TRUE_FALSE'
}

export type Quiz = {
  __typename?: 'Quiz';
  createdAt: Scalars['DateTime']['output'];
  entries?: Maybe<Array<Entry>>;
  id: Scalars['Int']['output'];
  questions?: Maybe<Array<Question>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  quizUpdated: Quiz;
};


export type SubscriptionQuizUpdatedArgs = {
  quizId: Scalars['Int']['input'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  entries?: Maybe<Array<Entry>>;
  id: Scalars['Int']['output'];
  isAdmin: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type CreateQuizMutationVariables = Exact<{
  title: Scalars['String']['input'];
  questions?: InputMaybe<Array<InputMaybe<QuestionInput>> | InputMaybe<QuestionInput>>;
}>;


export type CreateQuizMutation = { __typename?: 'Mutation', createQuiz: { __typename?: 'Quiz', title: string, questions?: Array<{ __typename?: 'Question', correctAnswer?: string | null, text: string, questionType: QuestionType }> | null } };

export type GetQuizzesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetQuizzesQuery = { __typename?: 'Query', getAllQuizzes: Array<{ __typename?: 'Quiz', id: number, title: string }> };


export const CreateQuizDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateQuiz"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"questions"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"QuestionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createQuiz"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}},{"kind":"Argument","name":{"kind":"Name","value":"questions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"questions"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"correctAnswer"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"questionType"}}]}}]}}]}}]} as unknown as DocumentNode<CreateQuizMutation, CreateQuizMutationVariables>;
export const GetQuizzesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetQuizzes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAllQuizzes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<GetQuizzesQuery, GetQuizzesQueryVariables>;