import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { blue } from 'server/helpers/console';
export function addDevLoggerMiddleware(dynamoDocClient: DynamoDBDocument) {
  dynamoDocClient.middlewareStack.add((next, context) => async (args) => {
    console.log(blue, `${context.commandName}`);
    console.log(blue, JSON.stringify(args.input, null, 2));
    const result = await next(args);
    console.log(blue, `${context.commandName} =>`);
    console.log(blue, JSON.stringify(result.output, null, 2));
    console.log('');
    return result;
  });
}
