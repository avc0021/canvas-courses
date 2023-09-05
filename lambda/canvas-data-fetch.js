const fetch = require('node-fetch');

exports.handler = async (event) => {
  const accessToken = event.headers.Authorization.split(' ')[1];

  try {
    const response = await fetch('https://uiw.test.instructure.com/api/v1/users/13294/courses', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from Canvas API');
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: 'Internal Server Error: ' + error.message
    };
  }
};
