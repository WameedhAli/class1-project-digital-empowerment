import { API_URL, cookies } from '../constants';

class API {
  constructor() {
    this.BASE_URL = API_URL;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
  }

  get authHeaders() {
    return {
      ...this.headers,
      Authorization: `Bearer ${cookies.get('auth')}`
    };
  }

  handleResponse = (response) => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) return response.json();
    return response;
  }

  getOptions(method, authRequired = false, body = null) {
    const options = {
      method: method.toUpperCase(),
      headers: this.headers
    };

    if (body) options.body = JSON.stringify(body);
    if (authRequired) options.headers = this.authHeaders;

    return options;
  }
}

export default API;
