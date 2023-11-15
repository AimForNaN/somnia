import { test, expect } from '@playwright/test';
import fetch from 'node-fetch';
import somnia from './../dist/somnia.js';

// Start tests!
test.describe('Basic Use', () => {
	var root = new URL('/api', 'http://example.com');
	var api = somnia(root, {
		fetch,
	});

	test('somnia', async () => {
		expect(String(api)).toEqual('http://example.com/api');
	});

	test('Merge without trailing slash', async () => {
		var noTrailingSlash = api('v1');
		expect(String(noTrailingSlash)).toEqual('http://example.com/api/v1');
	});

	test('Merge with trailing slash', async () => {
		var trailingSlash = api('v1/');
		expect(String(trailingSlash)).toEqual('http://example.com/api/v1/');
	});

	test('GET request', async () => {
		var api = somnia('http://httpbin.org/get', {
			fetch,
		});
		var result = await api.get();
		expect(result.status).toEqual(200);
	});

	test('GET parameters', async () => {
		var api = somnia('http://httpbin.org/anything', {
			fetch,
		});
		var result = await api.get({ test: 'test' });
		expect(result.data.args).toEqual({ test: 'test' });
	});

	test('POST request', async () => {
		var api = somnia('http://httpbin.org/anything', {
			fetch,
		});
		var result = await api.post({
			test: 'test',
		});
		expect(result.status).toEqual(200);
		expect(result.data.json).toEqual({ test: 'test' });

		var body = new FormData();
		// var body = new URLSearchParams();
		body.set('test', 'test');

		result = await api.post(body);
		expect(result.status).toEqual(200);
		expect(result.data.form).toEqual({ test: 'test' });
	});
});
