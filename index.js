import defaults from 'lodash-es/defaults';
import { joinURL, withQuery } from 'ufo';

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
			'content-type': 'application/json',
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

	_.delete = function () {
		return f('DELETE', url, opts);
	};
	_.get = function (params) {
		return f('GET', url, params, opts);
	};

	_.patch = function (data) {
		return f('PATCH', url, data, opts);
	};

	_.post = function (data) {
		return f('POST', url, data, opts);
	};

	_.put = function (data) {
		return f('PUT', url, data, opts);
	};

	_.toString = function () {
		return url;
	};

	return _;
}
