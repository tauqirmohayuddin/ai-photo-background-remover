// netlify/functions/remove-bg.js
const fetch = require('node-fetch'); // v2
const FormData = require('form-data');

exports.handler = async function (event, context) {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No request body' })
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      // if not JSON, fail
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body must be JSON' })
      };
    }

    // Accept many possible keys:
    const base64 = body.imageBase64 || body.ImageBase64 || body.image || body.Image || body.ImageBase64;
    if (!base64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No ImageBase64 provided' })
      };
    }

    // Remove any data URL prefix if present
    const cleanedBase64 = base64.replace(/^data:image\/\w+;base64,/, '');

    const REMOVE_BG_KEY = process.env.REMOVE_BG_API_KEY;
    if (!REMOVE_BG_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Remove.bg API key not configured (REMOVE_BG_API_KEY)' })
      };
    }

    // Build form-data payload for remove.bg API
    const form = new FormData();
    // remove.bg expects field name 'image_file_b64' when sending base64 in form-data
    form.append('image_file_b64', cleanedBase64);
    form.append('size', 'auto');

    // call remove.bg
    const resp = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_KEY,
        // note: form-data provides headers; we merge them
        ...form.getHeaders()
      },
      body: form
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      // return the error body for debugging
      return {
        statusCode: resp.status || 500,
        body: JSON.stringify({ error: 'remove.bg API error', status: resp.status, body: text })
      };
    }

    // remove.bg returns binary PNG. Convert to base64 and return to the front-end
    const buffer = await resp.buffer();
    const resultBase64 = buffer.toString('base64');

    // You can either return the base64 in JSON (our front-end can use it)
    return {
      statusCode: 200,
      body: JSON.stringify({ resultBase64 }) // front-end will use 'data:image/png;base64,' + resultBase64
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error', message: err.message })
    };
  }
};
