import defaults from 'lodash-es/defaultsDeep';
import { joinURL, withQuery } from 'ufo';

function defaultHeaders(data) {
	var ret = {
		accept: 'application/json',
	};
	var contentType = getContentTypeFromData(data);
	if (contentType) {
		ret['content-type'] = contentType;
	}
	return ret;
}

function getContentTypeFromData(data) {
	switch (true) {
		case data instanceof FormData:
		case data instanceof URLSearchParams: {
			return null;
		}
	}
	return 'application/json';
}

function isJson(headers) {
	if (headers.has('content-type')) {
		let ctype = headers.get('content-type');
		return typeof ctype == 'string' && ctype.includes('application/json');
	}
	return false;
}

function f(method = 'GET', url = '/', data = null, opts = {}) {
	var fetch = opts.fetch;
	delete opts.fetch;

	opts.method = String(method).toUpperCase();
	opts.headers = new Headers(defaults(opts.headers, defaultHeaders(data)));

	if (data) {
		switch (opts.method) {
			case 'GET': {
				url = withQuery(url, data);
				break;
			}
			case 'PATCH':
			case 'POST':
			case 'PUT': {
				if (isJson(opts.headers)) {
					data = JSON.stringify(data);
				}
				opts.body = data;
				break;
			}
		}
	}

	return new Promise((resolve, reject) => {
		if (typeof fetch != 'function') {
			reject('fetch is not a function!');
			return;
		}

		fetch(url, opts)
			.then((rsp) => {
				var { headers, ok, status, statusText, url } = rsp;
				var ret = {
					headers,
					data: null,
					status,
					statusText,
					url,
				};
				if (ok) {
					if (status == 204) {
						resolve(ret);
					} else if (isJson(headers)) {
						rsp.json().then((data) => {
							ret.data = data;
							resolve(ret);
						});
					} else {
						rsp.text().then((data) => {
							ret.data = data;
							resolve(ret);
						});
					}
				} else {
					reject(ret);
				}
			})
			.catch(reject);
	});
}

export default function somnia(url, opts) {
	url = String(url);
	opts = defaults(opts, {
		fetch: typeof window != 'undefined' ? window.fetch : null,
	});

	var _ = function (u, o) {
		// Extend parameters with previous ones
		u = String(u);
		u = joinURL(url, u);
		o = defaults(o, opts);
		return somnia(u, o);
	};

	_.delete = function (o = {}) {
		return f('DELETE', url, defaults(o, opts));
	};
	_.get = function (params, o = {}) {
		return f('GET', url, params, defaults(o, opts));
	};

	_.patch = function (data, o = {}) {
		return f('PATCH', url, data, defaults(o, opts));
	};

	_.post = function (data, o = {}) {
		return f('POST', url, data, defaults(o, opts));
	};

	_.put = function (data, o = {}) {
		return f('PUT', url, data, defaults(o, opts));
	};

	_.toString = function () {
		return url;
	};

	return _;
}
