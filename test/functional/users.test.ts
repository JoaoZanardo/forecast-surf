import { User } from '../../src/models/user';

describe('Users functional test', () => {
  beforeAll(async () => {
    await User.deleteMany();
  });

  describe('When creating a user', () => {
    it('should successfully create a new user', async () => {
      const newUser = {
        name: 'joao',
        email: 'joao@gmail.com',
        password: '12345',
      };

      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newUser));
    });
  });
});
