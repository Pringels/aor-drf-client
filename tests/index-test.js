import expect from 'expect';

import { convertRESTRequestToHTTP } from 'src/index';

let apiUrl = 'http://test.com/api/v1';

describe('Pagination', () => {
    it('param encodes pagination for 2 items on page 2', () => {
        var x = 1;
        let outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_LIST',
            resource: 'users',
            params: {
                pagination: {
                    page: 2,
                    perPage: 2
                }
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/?limit=2&offset=4`
        });
    });
});
describe('Sorting', () => {
    it('param encodes ascending ordering by name', () => {
        var x = 1;
        let outputUrl = convertRESTRequestToHTTP({
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
        var x = 1;
        let outputUrl = convertRESTRequestToHTTP({
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
describe('Search', () => {
    it('param encodes search query for "test"', () => {
        var x = 1;
        let outputUrl = convertRESTRequestToHTTP({
            apiUrl,
            type: 'GET_LIST',
            resource: 'users',
            params: {
                filter: 'test'
            }
        });
        expect(outputUrl).toEqual({
            options: {},
            url: `${apiUrl}/users/?search=test`
        });
    });
});
