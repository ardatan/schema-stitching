import { fragments } from './example-query';

export const exampleSubscription = /* GraphQL */ `
  subscription {
    newProduct {
      ...Product
      reviews {
        ...Review
        author {
          ...User
          reviews {
            ...Review
            product {
              ...Product
            }
          }
        }
      }
    }
  }
  ${fragments}
`;
