const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const response = await fetch('https://uiw.test.instructure.com/api/v1/users/13295/courses', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ...'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                statusCode: 200,
                body: JSON.stringify(data),
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch data from Canvas' }),
            };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred' }),
        };
    }
};
