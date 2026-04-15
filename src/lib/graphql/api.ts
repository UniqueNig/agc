import { graphqlRequest } from "./client";
import type {
  GraphQLContestant,
  GraphQLPayment,
  GraphQLStage,
} from "./types";

const CONTESTANT_FIELDS = `
  id
  name
  image
  contestantNumber
  totalVotes
  stageId
  status
  createdAt
  updatedAt
  stage {
    id
    name
    isActive
    contestantCount
    totalVotes
    createdAt
    updatedAt
  }
`;

const STAGE_FIELDS = `
  id
  name
  isActive
  contestantCount
  totalVotes
  createdAt
  updatedAt
`;

const PAYMENT_FIELDS = `
  id
  reference
  email
  amount
  votes
  contestantId
  authorizationUrl
  accessCode
  status
  verifiedAt
  createdAt
  updatedAt
  contestant {
    ${CONTESTANT_FIELDS}
  }
`;

export type HomePageData = {
  activeStage: GraphQLStage | null;
  contestants: GraphQLContestant[];
  leaderboard: GraphQLContestant[];
};

export async function fetchHomePageData() {
  return graphqlRequest<HomePageData>(`
    query HomePageData {
      activeStage {
        ${STAGE_FIELDS}
      }
      contestants {
        ${CONTESTANT_FIELDS}
      }
      leaderboard(limit: 7) {
        ${CONTESTANT_FIELDS}
      }
    }
  `);
}

export type ContestantsPageData = {
  activeStage: GraphQLStage | null;
  contestants: GraphQLContestant[];
};

export async function fetchContestantsPageData() {
  return graphqlRequest<ContestantsPageData>(`
    query ContestantsPageData {
      activeStage {
        ${STAGE_FIELDS}
      }
      contestants {
        ${CONTESTANT_FIELDS}
      }
    }
  `);
}

export type LeaderboardPageData = {
  activeStage: GraphQLStage | null;
  stages: GraphQLStage[];
  leaderboard: GraphQLContestant[];
};

export async function fetchLeaderboardPageData(stageId?: string) {
  return graphqlRequest<
    LeaderboardPageData,
    {
      stageId?: string;
    }
  >(
    `
      query LeaderboardPageData($stageId: ID) {
        activeStage {
          ${STAGE_FIELDS}
        }
        stages {
          ${STAGE_FIELDS}
        }
        leaderboard(stageId: $stageId, limit: 50) {
          ${CONTESTANT_FIELDS}
        }
      }
    `,
    stageId ? { stageId } : undefined
  );
}

export type VotePageData = {
  contestant: GraphQLContestant | null;
};

export async function fetchContestantById(id: string) {
  return graphqlRequest<
    VotePageData,
    {
      id: string;
    }
  >(
    `
      query VotePageData($id: ID!) {
        contestant(id: $id) {
          ${CONTESTANT_FIELDS}
        }
      }
    `,
    { id }
  );
}

export async function createVotePayment(input: {
  contestantId: string;
  votes: number;
  email: string;
}) {
  const data = await graphqlRequest<
    {
      createVotePayment: GraphQLPayment;
    },
    {
      input: {
        contestantId: string;
        votes: number;
        email: string;
      };
    }
  >(
    `
      mutation CreateVotePayment($input: CreateVotePaymentInput!) {
        createVotePayment(input: $input) {
          ${PAYMENT_FIELDS}
        }
      }
    `,
    { input }
  );

  return data.createVotePayment;
}

export type AdminDashboardData = {
  contestants: GraphQLContestant[];
  stages: GraphQLStage[];
  payments: GraphQLPayment[];
};

export async function fetchAdminDashboardData() {
  return graphqlRequest<AdminDashboardData>(`
    query AdminDashboardData {
      contestants {
        ${CONTESTANT_FIELDS}
      }
      stages {
        ${STAGE_FIELDS}
      }
      payments {
        ${PAYMENT_FIELDS}
      }
    }
  `);
}

export async function createContestant(input: {
  name: string;
  image?: string;
  contestantNumber: string;
  stageId?: string;
  status?: string;
}) {
  const data = await graphqlRequest<
    {
      createContestant: GraphQLContestant;
    },
    {
      input: {
        name: string;
        image?: string;
        contestantNumber: string;
        stageId?: string;
        status?: string;
      };
    }
  >(
    `
      mutation CreateContestant($input: CreateContestantInput!) {
        createContestant(input: $input) {
          ${CONTESTANT_FIELDS}
        }
      }
    `,
    { input }
  );

  return data.createContestant;
}

export async function updateContestant(
  id: string,
  input: {
    name?: string;
    image?: string;
    contestantNumber?: string;
    stageId?: string | null;
    status?: string;
    totalVotes?: number;
  }
) {
  const data = await graphqlRequest<
    {
      updateContestant: GraphQLContestant | null;
    },
    {
      id: string;
      input: {
        name?: string;
        image?: string;
        contestantNumber?: string;
        stageId?: string | null;
        status?: string;
        totalVotes?: number;
      };
    }
  >(
    `
      mutation UpdateContestant($id: ID!, $input: UpdateContestantInput!) {
        updateContestant(id: $id, input: $input) {
          ${CONTESTANT_FIELDS}
        }
      }
    `,
    { id, input }
  );

  return data.updateContestant;
}

export async function deleteContestant(id: string) {
  const data = await graphqlRequest<
    {
      deleteContestant: boolean;
    },
    {
      id: string;
    }
  >(
    `
      mutation DeleteContestant($id: ID!) {
        deleteContestant(id: $id)
      }
    `,
    { id }
  );

  return data.deleteContestant;
}

export async function createStage(input: {
  name: string;
  isActive?: boolean;
}) {
  const data = await graphqlRequest<
    {
      createStage: GraphQLStage;
    },
    {
      input: {
        name: string;
        isActive?: boolean;
      };
    }
  >(
    `
      mutation CreateStage($input: CreateStageInput!) {
        createStage(input: $input) {
          ${STAGE_FIELDS}
        }
      }
    `,
    { input }
  );

  return data.createStage;
}

export async function updateStage(
  id: string,
  input: {
    name?: string;
    isActive?: boolean;
  }
) {
  const data = await graphqlRequest<
    {
      updateStage: GraphQLStage | null;
    },
    {
      id: string;
      input: {
        name?: string;
        isActive?: boolean;
      };
    }
  >(
    `
      mutation UpdateStage($id: ID!, $input: UpdateStageInput!) {
        updateStage(id: $id, input: $input) {
          ${STAGE_FIELDS}
        }
      }
    `,
    { id, input }
  );

  return data.updateStage;
}

export async function activateStage(id: string) {
  const data = await graphqlRequest<
    {
      activateStage: GraphQLStage | null;
    },
    {
      id: string;
    }
  >(
    `
      mutation ActivateStage($id: ID!) {
        activateStage(id: $id) {
          ${STAGE_FIELDS}
        }
      }
    `,
    { id }
  );

  return data.activateStage;
}
