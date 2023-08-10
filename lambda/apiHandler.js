const https = require('https');
const querystring = require('querystring');

exports.handler = async (event) => {
  const code = event.queryStringParameters.code;
  
  // Log the code for debugging purposes
  console.log(`Received code: ${code}`);
  
  const data = querystring.stringify({
    grant_type: 'authorization_code',
    client_id: '139460000000000141',
    client_secret: 'MXfTiOCMvxHtg7NEJ5ce8TIRs44EpaAoaX33HwtYWkvP5kOlUTGM7yRzQnGr3Za3',
    redirect_uri: 'https://experience-test.elluciancloud.com/uotiwtest/',
    code: code
  });

console.log('Token exchange payload:', data); 

  const options = {
    hostname: 'canvas.instructure.com',
    path: '/login/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data)
    }
  };

return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          let parsedBody = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode <= 299) {
            resolve({
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
              },
              body: parsedBody
            });
          } else {
            let errorMessage = `Error from Canvas: ${parsedBody.error}, Description: ${parsedBody.error_description}`;
            console.error('Error response from Canvas:', errorMessage);
            reject({
              statusCode: res.statusCode,
              body: parsedBody,
              errorMessage: errorMessage
            });
          }
        } catch (e) {
          console.error('Error parsing response body:', e);
          reject({
            errorMessage: `Error parsing response body: ${e.message}`
          });
        }
      });
    });

    req.on('error', error => {
      console.error('Request failed:', error.message);
      reject({
        errorMessage: `Request failed: ${error.message}`
      });
    });
    req.write(data);
    req.end();
  });

};