describe('Beach functional tests', () => {
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
    });
});