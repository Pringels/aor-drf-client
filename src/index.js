import { stringify } from 'query-string';
import { fetchJson } from './util/fetch';
import {
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    CREATE,
    UPDATE,
    DELETE
} from './types';

/**
 * @param {String} apiUrl The base API url
 * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
 * @param {String} resource Name of the resource to fetch, e.g. 'posts'
 * @param {Object} params The REST request params, depending on the type
 * @returns {Object} { url, options } The HTTP request parameters
 */
export const convertRESTRequestToHTTP = ({
    apiUrl,
    type,
    resource,
    params
}) => {
    let url = '';
    const options = {};
    const query = {};

    switch (type) {
        case GET_MANY_REFERENCE: {
            query[params.target] = params.id;
        }
        case GET_LIST: {
            if (params.pagination) {
                const { page, perPage } = params.pagination;
                query['limit'] = perPage;
                query['offset'] = (page - 1) * perPage;
            }

            if (params.sort) {
                const { field, order } = params.sort;
                query['ordering'] = `${order === 'DESC' ? '-' : ''}` + field;
            }

            if (params.filter) {
                Object.keys(params.filter).forEach(key => {
                    query[key] = params.filter[key];
                });
            }

            url = `${apiUrl}/${resource}/?${stringify(query)}`;
            break;
        }
        case GET_ONE:
            url = `${apiUrl}/${resource}/${params.id}/`;
            break;
        case GET_MANY: {
            url = params.ids.map(id => {
                if (id.includes('http')) {
                    id = extractPrimaryKey(id);
                }
                return `${apiUrl}/${resource}/${id}/`;
            });
            break;
        }
        case UPDATE:
            url = `${apiUrl}/${resource}/${params.id}/`;
            options.method = 'PUT';
            options.body = JSON.stringify(params.data);
            break;
        case CREATE:
            url = `${apiUrl}/${resource}/`;
            options.method = 'POST';
            options.body = JSON.stringify(params.data);
            break;
        case DELETE:
            url = `${apiUrl}/${resource}/${params.id}/`;
            options.method = 'DELETE';
            break;
        default:
            throw new Error(`Unsupported fetch action type ${type}`);
    }
    return { url, options };
};

/**
 * @param {Object} response HTTP response from fetch()
 * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
 * @param {String} resource Name of the resource to fetch, e.g. 'posts'
 * @param {Object} params The REST request params, depending on the type
 * @returns {Object} REST response
 */
const convertHTTPResponseToREST = ({ response, type, resource, params }) => {
    const { headers, json } = response;

    switch (type) {
        case GET_LIST:
            return {
                data: json.results
                    ? json.results.map(res => ({ ...res, id: res.url }))
                    : json.map(res => ({ ...res, id: res.url })),
                total: json.count
            };
        case CREATE:
            return { data: { ...params.data, id: json.id } };
        default:
            return { data: { ...json, id: json.url } };
    }
};

/**
 * Returns the last param of a given url
 * @param {string} url
 */
const extractPrimaryKey = url => {
    let substrs = url.split('/');
    return substrs[substrs.length - 2];
};

/**
 * Maps admin-on-rest queries to Django Rest Framework
 *
 * The REST dialect is standard DRF with additional filtering back-ends:
 * @see http://www.django-rest-framework.org/api-guide/filtering/
 * @example
 * GET_LIST     => GET http://my.api.url/users?limit=10&offset=30&ordering=name
 * GET_ONE      => GET http://my.api.url/users/123
 * GET_MANY     => GET http://my.api.url/users/1/ GET http://my.api.url/users/2/
 * UPDATE       => PUT http://my.api.url/users/123
 * CREATE       => POST http://my.api.url/users/123
 * DELETE       => DELETE http://my.api.url/users/123
 */
export default (apiUrl, httpClient = fetchJson) => {
    /**
     * @param {string} type Request type, e.g GET_LIST
     * @param {string} resource Resource name, e.g. "users"
     * @param {Object} payload Request parameters. Depends on the request type
     * @returns {Promise} the Promise for a REST response
     */

    return async (type, resource, params) => {
        const { url, options } = convertRESTRequestToHTTP({
            apiUrl,
            type,
            resource,
            params
        });

        // If there are multiple urls then process them in parallel
        if (Array.isArray(url)) {
            const responses = await Promise.all(
                url.map(singleUrl =>
                    httpClient(singleUrl, options).then(response =>
                        convertHTTPResponseToREST({
                            response,
                            type,
                            resource,
                            params
                        })
                    )
                )
            );
            return {
                data: responses.map(res => res.data)
            };
        }

        return httpClient(url, options).then(response =>
            convertHTTPResponseToREST({
                response,
                type,
                resource,
                params
            })
        );
    };
};
