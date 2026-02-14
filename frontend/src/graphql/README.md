# GraphQL Operations

This directory contains all GraphQL queries, mutations, and fragments for the LiveQuiz frontend application.

## Structure

```
graphql/
├── fragments/
│   ├── question.ts      # Reusable question fragments
│   └── index.ts         # Fragment exports
├── queries/
│   ├── quiz.ts          # Quiz-related queries
│   ├── user.ts          # User-related queries
│   ├── entry.ts         # Entry-related queries
│   └── index.ts         # Query exports
└── mutations/
    ├── quiz.ts          # Quiz-related mutations
    ├── question.ts      # Question-related mutations
  ├── user.ts          # User-related mutations
  ├── entry.ts         # Entry-related mutations
    └── index.ts         # Mutation exports
```

## Fragments

Fragments are reusable pieces of GraphQL queries that help maintain consistency and reduce duplication across operations.

### Question Fragments

#### `QuestionCoreFields`
Basic question fields without answers. Use for public quiz views where answers should not be exposed.

```typescript
import { questionCoreFields } from '@/graphql/fragments';
```

**Fields:** `id`, `text`, `questionType`

#### `QuestionWithOptionsFields`
Question fields including options array. Useful for displaying multiple choice questions to users.

```typescript
import { questionWithOptionsFields } from '@/graphql/fragments';
```

**Fields:** `id`, `text`, `questionType`, `options`

#### `QuestionFullFields`
Complete question fields including the correct answer. Use for admin/edit views.

```typescript
import { questionFullFields } from '@/graphql/fragments';
```

**Fields:** `id`, `text`, `questionType`, `options`, `correctAnswer`

## Queries

### `getQuiz`
Fetches a single quiz with all its questions (including answers).

```typescript
import { getQuiz } from '@/graphql/queries';

const { data } = useQuery(getQuiz, {
  variables: { id: quizId }
});
```

### `getQuizzes`
Fetches all quizzes (title and id only).

```typescript
import { getQuizzes } from '@/graphql/queries';

const { data } = useQuery(getQuizzes);
```

### `getAllUsers`
Fetches all users for sign-in lookup.

```typescript
import { getAllUsers } from '@/graphql/queries';

const { data } = useQuery(getAllUsers);
```

### `getEntriesForUser`
Fetches quiz entries for a user.

```typescript
import { getEntriesForUser } from '@/graphql/queries';

const { data } = useQuery(getEntriesForUser, { variables: { userId } });
```

### `getEntryForUser`
Fetches a single quiz entry for a user.

```typescript
import { getEntryForUser } from '@/graphql/queries';

const { data } = useQuery(getEntryForUser, { variables: { quizId, userId } });
```

## Mutations

### `createQuiz`
Creates a new quiz with questions.

```typescript
import { createQuiz } from '@/graphql/mutations';

const [createQuizMutation] = useMutation(createQuiz);
```

### `updateQuestion`
Updates an existing question.

```typescript
import { updateQuestion } from '@/graphql/mutations';

const [updateQuestionMutation] = useMutation(updateQuestion);
```

### `createUser`
Creates a new user during sign-in.

```typescript
import { createUser } from '@/graphql/mutations';

const [createUserMutation] = useMutation(createUser);
```

### `upsertEntry`
Creates or updates a quiz entry for a user.

```typescript
import { upsertEntry } from '@/graphql/mutations';

const [upsertEntryMutation] = useMutation(upsertEntry);
```

## Best Practices

1. **Always use fragments** when querying question fields to maintain consistency
2. **Use appropriate fragments** based on context:
   - `QuestionCoreFields` for public views
   - `QuestionWithOptionsFields` when users need to see options
   - `QuestionFullFields` for admin/edit functionality
3. **Follow camelCase** naming convention for all operations
4. **Type operations** using generated TypeScript types from `@/generated/types`
5. **Co-locate related operations** in the same file (e.g., all quiz queries together)

## Adding New Operations

When adding new queries or mutations:

1. Create the operation in the appropriate file
2. Use existing fragments where applicable
3. Export from the directory's `index.ts`
4. Add documentation to this README

Example:

```typescript
// In queries/quiz.ts
import { questionFullFields } from "../fragments";

export const getQuizWithStats = gql`
  ${questionFullFields}
  query GetQuizWithStats($id: Int!) {
    getQuiz(id: $id) {
      id
      title
      questions {
        ...QuestionFullFields
      }
      stats {
        totalAttempts
        averageScore
      }
    }
  }
`;
```
