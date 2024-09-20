let fetch;

exports.handler = async (event) => {
    // Ensure fetch is imported
    if (!fetch) {
        fetch = await import('node-fetch').then(mod => mod.default);
    }

    // Check if queryStringParameters exist and contain bannerId
    if (!event.queryStringParameters || !event.queryStringParameters.bannerId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'bannerId not provided in query parameters' }),
        };
    }

    const bannerId = event.queryStringParameters.bannerId;
       // Log the received bannerId
    console.log(`Received bannerId: ${bannerId}`);

    try {
        const response = await fetch(`https://uiw.instructure.com/api/v1/users/sis_user_id:${bannerId}/courses?include[]=total_scores&enrollment_type=student&per_page=10`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer 13946~PKu1WJqjNMi16OSD8Z9VQLh9gTc5SLk6bcAS7ZQqWiAj5sp8qshKDo4RCpxQfhLr'
            }
        });

if (response.ok) {
    const data = await response.json();
    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
} else {
    const errorData = await response.text(); // get the error message from Canvas
    console.error(`Canvas API responded with status ${response.status} and body: ${errorData}`);
    return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch data from Canvas', canvasError: errorData }),
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
