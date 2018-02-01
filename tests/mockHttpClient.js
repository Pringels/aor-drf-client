export const mockHttpClient = () => {
    return new Promise(resolve =>
        resolve({
            headers: {
                foo: 'bar'
            },
            json: {
                baz: 'boo'
            }
        })
    );
};
