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
    console.log(`Received bannerId: ${bannerId}`);

    try {
        // Fetch the user's courses from Canvas API
        const courseResponse = await fetch(`https://uiw.instructure.com/api/v1/users/sis_user_id:${bannerId}/courses?include[]=total_scores&enrollment_type=student&per_page=100`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer 13946~PKu1WJqjNMi16OSD8Z9VQLh9gTc5SLk6bcAS7ZQqWiAj5sp8qshKDo4RCpxQfhLr'
            }
        });

        if (!courseResponse.ok) {
            const errorData = await courseResponse.text();
            console.error(`Canvas API responded with status ${courseResponse.status} and body: ${errorData}`);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch data from Canvas', canvasError: errorData }),
            };
        }

        const courseData = await courseResponse.json();

        // Fetch the terms from Canvas API
        const termsResponse = await fetch(`https://uiw.instructure.com/api/v1/accounts/1/terms?per_page=150`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer 13946~PKu1WJqjNMi16OSD8Z9VQLh9gTc5SLk6bcAS7ZQqWiAj5sp8qshKDo4RCpxQfhLr'
            }
        });

        if (!termsResponse.ok) {
            const errorData = await termsResponse.text();
            console.error(`Terms API responded with status ${termsResponse.status} and body: ${errorData}`);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch terms from Canvas', canvasError: errorData }),
            };
        }

        const termsData = await termsResponse.json();

        // Return both course data and terms data
        return {
            statusCode: 200,
            body: JSON.stringify({ courses: courseData, terms: termsData.enrollment_terms }),
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred' }),
        };
    }
};
