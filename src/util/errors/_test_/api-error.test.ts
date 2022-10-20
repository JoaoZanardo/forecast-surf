import APiError from '../api-error';

describe('Api Error Util', () => {
  it('should format error with mandatory fields', () => {
    const error = APiError.format({
      code: 429,
      message: 'Too many request to /example endpoint',
    });
    expect(error).toEqual({
      message: 'Too many request to /example endpoint',
      error: 'Too Many Requests',
      code: 429,
    });
  });

  it('should format error with mandatory fields and description', () => {
    const error = APiError.format({
      code: 404,
      message: 'User not found',
      description: 'This error happens when user is not found in database',
    });
    expect(error).toEqual({
      message: 'User not found',
      error: 'Not Found',
      code: 404,
      description: 'This error happens when user is not found in database',
    });
  });

  it('should format error with mandatory fields and documentation', () => {
    const error = APiError.format({
      code: 404,
      message: 'User not found',
      documentation: 'https://mydocs.com/error-404',
    });
    expect(error).toEqual({
      message: 'User not found',
      error: 'Not Found',
      code: 404,
      documentation: 'https://mydocs.com/error-404',
    });
  });
});
