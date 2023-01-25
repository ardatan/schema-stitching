import { productsServer } from "./server.js";

productsServer.listen(4003, () => {
    console.log('products running at http://localhost:4003/graphql');
})