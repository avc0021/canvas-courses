const fetch = require('node-fetch');

exports.handler = async (event) => {
  const code = event.queryStringParameters.code;
// Log the received code
  console.log('Received Code:', code); 

  const tokenData = {
    client_id: "139460000000000141",
    client_secret: "MXfTiOCMvxHtg7NEJ5ce8TIRs44EpaAoaX33HwtYWkvP5kOlUTGM7yRzQnGr3Za3",
    redirect_uri: 'https://4to280pvw8.execute-api.us-east-2.amazonaws.com/default/canvas-code-to-token',
    code: code,
    grant_type: 'authorization_code',
    scope: 'url:GET|/api/v1/users/:user_id/courses'
  };

  try {
    const tokenResponse = await fetch('https://uiw.test.instructure.com/login/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams(tokenData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for access token');
    }

    const token = await tokenResponse.json();

    // Redirect back to your React App, passing along the access token
    return {
      statusCode: 302,
      headers: {
        Location: `https://experience-test.elluciancloud.com/uotiwtest/?access_token=${token.access_token}`,
      },
      body: ''
    };

  } catch (error) {
    // Log any error that is thrown
       console.log('Error:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error: ' + error.message
    };
  }
};
