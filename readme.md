# Ellucian Experience - Courses
## Introduction
This project is a custom card for the Ellucian Experience platform, designed to enhance the student experience by providing a quick and intuitive overview of their current courses and grades. Leveraging the React SDK for seamless integration with the Ellucian Experience, this extension offers students a personalized view of their academic progress, with data fetched from Canvas using AWS Lambda as middleware.

## Features
Course Overview: Displays a list of the user's current courses, including course names and codes.
Grades Overview: Shows the most recent grades for each course, allowing students to monitor their academic performance at a glance.
Responsive Design: Ensures a consistent and accessible user experience across desktop and mobile devices.

## How It Works
The Ellucian Experience Card for Courses and Grades interfaces with Canvas to provide up-to-date academic information. Here's how the data flow works:

Authentication: Users are authenticated on the Ellucian Experience platform using their institution credentials.
AWS Lambda Middleware: Custom AWS Lambda functions act as middleware to securely fetch the user's course and grades data from Canvas.
Data Retrieval and Presentation: The middleware queries Canvas for the current course enrollments and associated grades, then formats and displays this data within the card, offering a snapshot of the user's academic standing.

## Architectural Overview
Canvas LMS Integration: Utilizes the Canvas LMS API to access course and grade information.
AWS Lambda: Serverless functions are deployed to AWS Lambda, handling API requests to Canvas. This setup ensures scalability and security, abstracting the data retrieval logic away from the client-side application.
