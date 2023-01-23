import { resizeImagesServer } from "./server";

resizeImagesServer.listen(4002, () => console.log('resize images service running at http://localhost:4002/graphql'));
