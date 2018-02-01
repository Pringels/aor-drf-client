import expect from 'expect';

import aorClient, { convertRESTRequestToHTTP } from 'src/index';
import { mockHttpClient } from './mockHttpClient';

let apiUrl = 'http://test.com/api/v1';

describe('GET_LIST: Pagination', () => {
    it('param encodes pagination for 1 item on page 1', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_LIST',
            resource: 'users',
            params: {
                pagination: {
                    page: 1,
                    perPage: 1
                }
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/?limit=1&offset=0`
        });
    });

    it('param encodes pagination for 2 items on page 3', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_LIST',
            resource: 'users',
            params: {
                pagination: {
                    page: 3,
                    perPage: 2
                }
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/?limit=2&offset=4`
        });
    });

    it('param encodes pagination for 10 items on page 4', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_LIST',
            resource: 'users',
            params: {
                pagination: {
                    page: 4,
                    perPage: 10
                }
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/?limit=10&offset=30`
        });
    });
});

describe('GET_LIST: Sorting', () => {
    it('param encodes ascending ordering by name', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_LIST',
            resource: 'users',
            params: {
                sort: {
                    field: 'name',
                    order: 'ASC'
                }
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/?ordering=name`
        });
    });

    it('param encodes descending ordering by name', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_LIST',
            resource: 'users',
            params: {
                sort: {
                    field: 'name',
                    order: 'DESC'
                }
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/?ordering=-name`
        });
    });
});

describe('GET_LIST: Filter', () => {
    it('param encodes ID 1 for field "group"', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_LIST',
            resource: 'users',
            params: {
                filter: { group: 1 }
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/?group=1`
        });
    });

    it('param encodes ID 7 for field "category" and ID 12 for field "group"', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_LIST',
            resource: 'users',
            params: {
                filter: { category: 7, group: 12 }
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/?category=7&group=12`
        });
    });
});

describe('GET_ONE', () => {
    it('param encodes user with ID 1', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_ONE',
            resource: 'users',
            params: {
                id: 1
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/1/`
        });
    });
});

describe('GET_MANY', () => {
    it('param encodes users with IDs 1, 2 and 3', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_MANY',
            resource: 'users',
            params: {
                ids: [1, 2, 3]
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: [
                `${apiUrl}/users/1/`,
                `${apiUrl}/users/2/`,
                `${apiUrl}/users/3/`
            ]
        });
    });
});

describe('GET_MANY_REFERENCE', () => {
    it('param encodes users filtered by group reference ID 123', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_MANY_REFERENCE',
            resource: 'users',
            params: {
                target: 'groups',
                id: 123
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/?groups=123`
        });
    });

    it('param encodes users filtered by group reference ID 123 and sorting params', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_MANY_REFERENCE',
            resource: 'users',
            params: {
                target: 'groups',
                id: 123,
                pagination: {
                    page: 4,
                    perPage: 10
                },
                sort: {
                    field: 'name',
                    order: 'ASC'
                }
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/?groups=123&limit=10&offset=30&ordering=name`
        });
    });
});

describe('UPDATE', () => {
    it('sets PUT method and serialized payload body', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'UPDATE',
            resource: 'users',
            params: {
                id: 123,
                data: {
                    name: 'Portia'
                }
            }
        });
        expect(outputUrl).toEqual({
            options: {
                method: 'PUT',
                body: '{"name":"Portia"}'
            },
            url: `${apiUrl}/users/123/`
        });
    });
});

describe('CREATE', () => {
    it('sets POST method and serialized payload body', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'CREATE',
            resource: 'users',
            params: {
                data: {
                    name: 'Portia'
                }
            }
        });
        expect(outputUrl).toEqual({
            options: {
                method: 'POST',
                body: '{"name":"Portia"}'
            },
            url: `${apiUrl}/users/`
        });
    });
});

describe('DELETE', () => {
    it('sets DELETE method', () => {
        const outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'DELETE',
            resource: 'users',
            params: {
                id: 123
            }
        });
        expect(outputUrl).toEqual({
            options: {
                method: 'DELETE'
            },
            url: `${apiUrl}/users/123/`
        });
    });
});

describe('Http handlers', () => {
    it('checks response type of request', done => {
        const request = aorClient(apiUrl, mockHttpClient)('DELETE', 'users', {
            id: 100
        });
        request.then(response => {
            expect(response).toEqual({
                headers: {
                    method: 'DELETE'
                },
                json: {
                    baz: 'boo'
                }
            });
            done();
        });
    });
});
