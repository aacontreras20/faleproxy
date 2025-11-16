const request = require('supertest');
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const nock = require('nock');
const { sampleHtmlWithYale } = require('./test-utils');

// Import and setup a test version of the app
const testApp = express();
testApp.use(express.json());
testApp.use(express.urlencoded({ extended: true }));

// Use the same route handler as the main app
testApp.post('/fetch', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    // Process text nodes in the body
    $('body *').contents().filter(function() {
      return this.nodeType === 3;
    }).each(function() {
      const text = $(this).text();
      const newText = text.replace(/Yale/g, 'Fale').replace(/yale/g, 'fale').replace(/YALE/g, 'FALE');
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });

    // Process title separately
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
    nock('https://example.com')
      .get('/')
      .reply(200, sampleHtmlWithYale);

    const response = await request(testApp)
      .post('/fetch')
      .send({ url: 'https://example.com/' });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

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
    nock('http://not-a-valid-url')
      .get('/')
      .replyWithError('Invalid URL');

    const response = await request(testApp)
      .post('/fetch')
      .send({ url: 'http://not-a-valid-url/' });

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toContain('Failed to fetch content');
  });

  test('Should handle missing URL parameter', async () => {
    const response = await request(testApp)
      .post('/fetch')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('URL is required');
  });
});
