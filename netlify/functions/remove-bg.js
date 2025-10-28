// Minimal CommonJS Netlify Function for background removal demo

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const imageBase64 = body.imageBase64;

    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No imageBase64 provided" }),
      };
    }

    // Simulated processing (in real use, call your background removal API here)
    return {
      statusCode: 200,
      body: JSON.stringify({
        imageBase64: imageBase64, // echo back same image
        message: "Background removed (demo response)",
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
