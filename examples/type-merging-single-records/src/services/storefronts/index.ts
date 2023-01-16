import { storefrontsServer } from "./server";

storefrontsServer.listen(4003, () => {
    console.info('Storefronts service listening on http://localhost:4003');
});
