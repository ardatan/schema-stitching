const users = [
  { id: '1', username: 'hansolo' },
  { id: '2', username: 'yoda' },
];

export const resolvers = {
  Query: {
    user: (_, { id }) => users.find(u => u.id === id),
  },
};
