import defaults from 'lodash-es/defaultsDeep';
import { joinURL, withQuery } from 'ufo';

function generateBoundary() {
	var boundary = '--------------------------';
	for (var i = 0; i < 24; i++) {
		boundary += Math.floor(Math.random() * 10).toString(16);
	}
	return boundary;
};

function getContentTypeFromData(data) {
	if (data instanceof FormData) {
		return 'application/x-www-form-urlencoded';
		return `multipart/form-data; boundary=${generateBoundary()}`;
	}
	return 'application/json';
}

function isJson(headers) {
	if (headers.has('content-type')) {
		let ctype = headers.get('content-type');
		ctype = ctype.split(', ');
		return ctype.includes('application/json');
	}
	return false;
}

function f(method = 'GET', url = '/', data = null, opts = {}) {
	method = String(method).toUpperCase();

	opts.method = method;
	opts.headers = new Headers(
		defaults(opts.headers, {
			'accept': 'application/json',
			'content-type': getContentTypeFromData(data),
		})
	);

	if (data) {
		switch (method) {
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

	var fetch = null;
	if (typeof window != 'undefined') {
		fetch = window.fetch;
	} else if (
		typeof process === 'object' &&
		Object.prototype.toString.call(process) === '[object process]'
	) {
		fetch = (...args) =>
			import('node-fetch').then(({ default: fetch }) => fetch(...args));
	}

	return new Promise((resolve, reject) => {
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
	opts = defaults(opts, {});

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
