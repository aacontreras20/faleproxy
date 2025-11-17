const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for meta search
app.post('/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Simulate meta search across multiple sources with ranking
    // In a real implementation, this would query multiple search engines/APIs
    const results = await performMetaSearch(query);

    return res.json({
      success: true,
      query: query,
      results: results,
      count: results.length
    });
  } catch (error) {
    console.error('Error performing search:', error.message);
    return res.status(500).json({
      error: `Search failed: ${error.message}`
    });
  }
});

// Mock meta search function - simulates searching multiple sources
async function performMetaSearch(query) {
  // In a real implementation, this would:
  // 1. Query multiple search engines (Google, Bing, DuckDuckGo, etc.)
  // 2. Aggregate and deduplicate results
  // 3. Rank results using a scoring algorithm

  // For POC, we'll simulate with mock data based on query
  const mockResults = [
    {
      title: `Understanding ${query} - Academic Resource`,
      description: `Comprehensive guide to ${query} covering fundamental concepts and advanced topics. Learn from experts in the field.`,
      url: `https://www.example.edu/topics/${query.toLowerCase().replace(/\s+/g, '-')}`,
      source: 'Academic Database',
      score: 0.95
    },
    {
      title: `${query} - Wikipedia`,
      description: `Wikipedia article providing an overview of ${query}, including history, key concepts, and references.`,
      url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
      source: 'Wikipedia',
      score: 0.92
    },
    {
      title: `Latest News About ${query}`,
      description: `Recent news articles and updates related to ${query}. Stay informed with the latest developments.`,
      url: `https://news.example.com/topic/${query.toLowerCase().replace(/\s+/g, '-')}`,
      source: 'News Aggregator',
      score: 0.88
    },
    {
      title: `${query}: Best Practices and Examples`,
      description: `Practical guide with real-world examples and best practices for ${query}. Includes tutorials and case studies.`,
      url: `https://tutorials.example.com/${query.toLowerCase().replace(/\s+/g, '-')}`,
      source: 'Tutorial Site',
      score: 0.85
    },
    {
      title: `Forum Discussion: ${query}`,
      description: `Community discussions and Q&A about ${query}. Get insights from practitioners and enthusiasts.`,
      url: `https://forum.example.com/discuss/${query.toLowerCase().replace(/\s+/g, '-')}`,
      source: 'Community Forum',
      score: 0.78
    }
  ];

  // Sort by relevance score (descending)
  return mockResults.sort((a, b) => b.score - a.score);
}

// API endpoint to fetch and modify content
app.post('/fetch', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Fetch the content from the provided URL
    const response = await axios.get(url);
    const html = response.data;

    // Use cheerio to parse HTML and selectively replace text content, not URLs
    const $ = cheerio.load(html);

    // Process text nodes in the body
    $('body *').contents().filter(function() {
      return this.nodeType === 3; // Text nodes only
    }).each(function() {
      // Replace text content but not in URLs or attributes
      const text = $(this).text();
      const newText = text.replace(/Yale/g, 'Fale').replace(/yale/g, 'fale').replace(/YALE/g, 'FALE');;
      if (text !== newText) {
        $(this).replaceWith(newText);
      }
    });
    
    // Process title separately
    const title = $('title').text().replace(/Yale/g, 'Fale').replace(/yale/g, 'fale').replace(/YALE/g, 'FALE');;
    $('title').text(title);
    
    return res.json({ 
      success: true, 
      content: $.html(),
      title: title,
      originalUrl: url
    });
  } catch (error) {
    console.error('Error fetching URL:', error.message);
    return res.status(500).json({ 
      error: `Failed to fetch content: ${error.message}` 
    });
  }
});

// Export the app for testing
module.exports = app;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Faleproxy server running at http://localhost:${PORT}`);
  });
}
