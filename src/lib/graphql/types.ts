export type ContestantStatus = "active" | "pending" | "eliminated";
export type PaymentStatus = "pending" | "success" | "failed";

export interface GraphQLStage {
  id: string;
  name: string;
  isActive: boolean;
  contestantCount: number;
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface GraphQLContestant {
  id: string;
  name: string;
  image?: string | null;
  contestantNumber: string;
  totalVotes: number;
  stageId?: string | null;
  status: ContestantStatus;
  stage?: GraphQLStage | null;
  createdAt: string;
  updatedAt: string;
}

export interface GraphQLPayment {
  id: string;
  reference: string;
  email: string;
  amount: number;
  votes: number;
  contestantId: string;
  authorizationUrl: string;
  accessCode: string;
  status: PaymentStatus;
  verifiedAt?: string | null;
  contestant?: GraphQLContestant | null;
  createdAt: string;
  updatedAt: string;
}

export interface GraphQLVote {
  id: string;
  contestantId: string;
  paymentId?: string | null;
  reference: string;
  email: string;
  votes: number;
  amount: number;
  status: PaymentStatus;
  contestant?: GraphQLContestant | null;
  payment?: GraphQLPayment | null;
  createdAt: string;
  updatedAt: string;
}
