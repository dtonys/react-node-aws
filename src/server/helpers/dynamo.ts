import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { cyan } from 'server/helpers/console';
export function addDevLoggerMiddleware(dynamoDocClient: DynamoDBDocument) {
  dynamoDocClient.middlewareStack.add((next, context) => async (args) => {
    console.log(cyan, `${context.commandName}`);
    console.log(cyan, JSON.stringify(args.input, null, 2));
    const result = await next(args);
    console.log(cyan, `${context.commandName} =>`);
    console.log(cyan, JSON.stringify(result.output, null, 2));
    console.log('');
    return result;
  });
}
