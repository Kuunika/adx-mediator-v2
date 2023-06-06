import { JsonErrorHandlerMiddleware } from './json-error-handler.middleware';

describe('JsonErrorHandlerMiddleware', () => {
  it('should be defined', () => {
    expect(new JsonErrorHandlerMiddleware()).toBeDefined();
  });
});
