import { test, expect } from '@playwright/test';
import somnia from './../dist/somnia.js';

// Start tests!
test.describe('Basic Use', () => {
	var root = new URL('/api', 'http://example.com');
	var api = somnia(root);

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
		var api = somnia('http://example.com/');
		var result = await api.get();
		expect(result.status).toEqual(200);
	});

	test('GET parameters', async () => {
		var api = somnia('http://example.com/');
		var result = await api.get({ test: 'test' });
		expect(result.url).toEqual('http://example.com/?test=test');
	});
});
