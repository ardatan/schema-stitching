import { GraphQLError } from "graphql";

export class NotFoundError extends GraphQLError {
    constructor(message = 'Record not found') {
        super(message, {
            extensions: {
                code: 'NOT_FOUND'
            }
        })
    }
}