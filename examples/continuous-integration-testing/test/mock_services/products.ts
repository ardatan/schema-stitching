const products = [
  { upc: '1', name: 'gizmo' },
  { upc: '2', name: 'widget' },
];

export const resolvers = {
  Query: {
    products: (_, { upcs }) => upcs.map(upc => products.find(p => p.upc === upc)),
  },
};

export const mocks = {
  Int: () => 23,
};
