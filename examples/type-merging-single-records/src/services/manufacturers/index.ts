import { manufacturerServer } from "./server";

manufacturerServer.listen(4001, () => {
    console.info('Manufacturers service listening on http://localhost:4001');
})
