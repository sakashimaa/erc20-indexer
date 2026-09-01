export const typeDefs = /* GraphQL */ `
  enum TransferDirection {
    IN
    OUT
    SELF
  }

  type Transfer {
    id: ID!
    blockNumber: String!
    logIndex: Int!
    transactionHash: String!
    fromAddress: String!
    toAddress: String!
    value: String!
    blockTimestamp: String!
  }

  type HolderTransfer {
    id: ID!
    blockNumber: String!
    logIndex: Int!
    transactionHash: String!
    fromAddress: String!
    toAddress: String!
    value: String!
    blockTimestamp: String!
    direction: TransferDirection!
  }

  type HolderList {
    address: String!
    balance: String!
    updatedAtBlock: String
    transfers(limit: Int = 5): [HolderTransfer!]!
  }

  type Holder {
    address: String!
    balance: String!
    updatedAtBlock: String
    indexedFromBlock: String
    lastProcessedBlock: String
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type TransferEdge {
    cursor: String!
    node: Transfer!
  }

  type TransferConnection {
    edges: [TransferEdge!]!
    pageInfo: PageInfo!
  }

  type Query {
    transfers(first: Int = 20, token: String!, after: String): TransferConnection!
    holders(limit: Int = 100, page: Int = 1, token: String!): [HolderList!]!
    holder(address: String!, token: String!): Holder!
  }
`;
