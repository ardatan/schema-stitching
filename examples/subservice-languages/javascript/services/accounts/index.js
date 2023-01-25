import { accountsServer } from "./server.js";

accountsServer.listen(4001, () => {
    console.log("Accounts ready at http://localhost:4001/graphql");
})