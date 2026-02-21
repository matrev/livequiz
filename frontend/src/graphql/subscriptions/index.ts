import { gql, TypedDocumentNode } from "@apollo/client";
import { LeaderboardUpdatedSubscription, LeaderboardUpdatedSubscriptionVariables } from "@/generated/types";

export const leaderboardUpdated: TypedDocumentNode<
	LeaderboardUpdatedSubscription,
	LeaderboardUpdatedSubscriptionVariables
> = gql`
	subscription LeaderboardUpdated($quizId: Int!) {
		leaderboardUpdated(quizId: $quizId) {
			userId
			name
			score
			correctCount
			answeredCount
			rank
			updatedAt
		}
	}
`;
