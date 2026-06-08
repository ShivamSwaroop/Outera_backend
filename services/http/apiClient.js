import axios from "axios";

export const createApiClient = (baseURL, headers = {}) => {
    return axios.create({
        baseURL,
        timeout: 30000,
        headers
    });
};