import { Beach } from "@src/models/beach";

describe('Beach functional tests', () => {
    beforeAll(async() => await Beach.deleteMany({}));

    describe('When creating a beach', () => {
        it ('should create a beach with success', async () => {
            const beachBody = {
                lat: -33.792726,
                lng: 151.289824,
                name: 'Manly',
                position: 'E',
            };

            const response = await global.testRequest.post('/beaches').send(beachBody);
            expect(response.status).toEqual(201);
            expect(response.body).toEqual(expect.objectContaining(beachBody));
        });

        it('should return 422 when there is a validation error', async () => {
            const newBeach = {
              lat: 'invalid_string',
              lng: 151.289824,
              name: 'Manly',
              position: 'E',
            };
            const response = await global.testRequest.post('/beaches').send(newBeach);
      
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
              error:
                'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"',
            });
          });
      
          it.skip('should return 500 when there is any error other than validation error', async () => {
            //TODO think in a way to throw a 500
          });
    });
});