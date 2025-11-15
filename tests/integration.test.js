const axios = require('axios');
const cheerio = require('cheerio');
const request = require('supertest');
const express = require('express');
const { sampleHtmlWithYale } = require('./test-utils');
const nock = require('nock');

// Create axios instance without proxy for testing
const testAxios = axios.create({
  proxy: false,
  httpAgent: false,
  httpsAgent: false
});

// Create test app (same as in api.test.js but for integration testing)
const testApp = express();
testApp.use(express.json());
testApp.use(express.urlencoded({ extended: true }));

testApp.post('/fetch', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await testAxios.get(url);
    const html = response.data;

    const $ = require('cheerio').load(html);

    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      const newText = text.replace(/Yale/g, 'Fale').replace(/yale/g, 'fale').replace(/YALE/g, 'FALE');
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });

    const title = $('title').text().replace(/Yale/g, 'Fale').replace(/yale/g, 'fale').replace(/YALE/g, 'FALE');
    $('title').text(title);

    return res.json({
      success: true,
      content: $.html(),
      title: title,
      originalUrl: url
    });
  } catch (error) {
    return res.status(500).json({
      error: `Failed to fetch content: ${error.message}`
    });
  }
});

describe('Integration Tests', () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1');
  });

  afterAll(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('Should replace Yale with Fale in fetched content', async () => {
    // Setup mock for example.com
    nock('https://example.com')
      .get('/')
      .reply(200, sampleHtmlWithYale);

    // Make a request to our proxy app
    const response = await request(testApp)
      .post('/fetch')
      .send({ url: 'https://example.com/' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify Yale has been replaced with Fale in text
    const $ = cheerio.load(response.body.content);
    expect($('title').text()).toBe('Fale University Test Page');
    expect($('h1').text()).toBe('Welcome to Fale University');
    expect($('p').first().text()).toContain('Fale University is a private');

    // Verify URLs remain unchanged
    const links = $('a');
    let hasYaleUrl = false;
    links.each((i, link) => {
      const href = $(link).attr('href');
      if (href && href.includes('yale.edu')) {
        hasYaleUrl = true;
      }
    });
    expect(hasYaleUrl).toBe(true);

    // Verify link text is changed
    expect($('a').first().text()).toBe('About Fale');
  });

  test('Should handle invalid URLs', async () => {
    nock('https://error-site.com')
      .get('/')
      .replyWithError('Connection refused');

    const response = await request(testApp)
      .post('/fetch')
      .send({ url: 'https://error-site.com/' });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain('Failed to fetch content');
  });

  test('Should handle missing URL parameter', async () => {
    const response = await request(testApp)
      .post('/fetch')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('URL is required');
  });
});
