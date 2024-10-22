import React, { useEffect, useState, Fragment } from 'react';
import { Table, TableBody, TableCell, TableRow, Button } from '@ellucian/react-design-system/core';
import { spacing40, spacing10 } from '@ellucian/react-design-system/core/styles/tokens';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import PropTypes from 'prop-types';
import { useIntl, IntlProvider } from 'react-intl';

// Styles for the courses
const columnStyles = {
    height: '100%',
    marginTop: 0,
    marginRight: spacing40,
    marginBottom: spacing10,
    marginLeft: spacing40,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around'
};

// Styles for the card
const styles = () => ({
    card: {
        height: '90%',
        marginRight: spacing40,
        marginLeft: spacing40,
        paddingBottom: spacing10
    },
    text: {
        marginRight: spacing40,
        marginLeft: spacing40
    },
    buttonContainer: {
        marginTop: spacing10,
        marginBottom: spacing10,
        paddingBottom: spacing40
    },
    disclaimer: {
        fontStyle: 'italic',
        marginBottom: '10px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px'
    }
});

const cacheKey = 'graphql-card:persons';

// Utility functions for filtering courses
function isThisYear(date) {
    const courseYear = new Date(date).getFullYear();
    const currentYear = new Date().getFullYear();
    return courseYear === currentYear;
}

function sortCoursesByDate(a, b) {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA;
}

// Function to get the current term based on the date
function getCurrentTerm(terms) {
    const currentDate = new Date();

    // Define term ranges
    const fallStart = new Date(currentDate.getFullYear(), 7, 1);
    const fallEnd = new Date(currentDate.getFullYear(), 11, 31);
    const springStart = new Date(currentDate.getFullYear(), 0, 1);
    const springEnd = new Date(currentDate.getFullYear(), 4, 14);
    const summerStart = new Date(currentDate.getFullYear(), 4, 15);
    const summerEnd = new Date(currentDate.getFullYear(), 6, 31);

    if (currentDate >= fallStart && currentDate <= fallEnd) {
        return terms.filter(term => {
            const startDate = new Date(term.start_at);
            const endDate = new Date(term.end_at);
            return startDate.getMonth() >= 7 && endDate.getMonth() <= 11 && startDate.getFullYear() === currentDate.getFullYear();
        });
    } else if (currentDate >= springStart && currentDate <= springEnd) {
        return terms.filter(term => {
            const startDate = new Date(term.start_at);
            const endDate = new Date(term.end_at);
            return startDate.getMonth() >= 0 && endDate.getMonth() <= 4 && startDate.getFullYear() === currentDate.getFullYear();
        });
    } else if (currentDate >= summerStart && currentDate <= summerEnd) {
        return terms.filter(term => {
            const startDate = new Date(term.start_at);
            const endDate = new Date(term.end_at);
            return startDate.getMonth() >= 4 && endDate.getMonth() <= 6 && startDate.getFullYear() === currentDate.getFullYear();
        });
    } else {
        return [];
    }
}

// CanvasCard component
const CanvasCard = (props) => {
    const {
        classes,
        cardControl: { setLoadingStatus, setErrorMessage },
        data: { getEthosQuery },
        cache: { getItem, storeItem }
    } = props;

    const intl = useIntl();
    const [persons, setPersons] = useState([]);
    const [canvasData, setCanvasData] = useState([]);
    const [currentPersonIndex, setCurrentPersonIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingStatus(true);
            const { data: cachedData, expired: cachedDataExpired = true } = await getItem({ key: cacheKey });

            if (cachedData) {
                setPersons(cachedData);
                console.log('Cached persons:', cachedData);
                setLoadingStatus(false);
            }

            if (cachedDataExpired || cachedData === undefined) {
                try {
                    const personsData = await getEthosQuery({ queryId: 'list-persons' });
                    const { data: { persons: { edges: personEdges } = [] } = {} } = personsData;
                    const persons = personEdges.map(edge => edge.node);
                    console.log('Fetched persons:', persons);
                    setPersons(persons);
                    storeItem({ key: cacheKey, data: persons });
                    setLoadingStatus(false);
                } catch (error) {
                    console.error('EthosQuery failed', error);
                    setErrorMessage({
                        headerMessage: intl.formatMessage({ id: 'PersonInformationCard-fetchFailed' }),
                        textMessage: intl.formatMessage({ id: 'PersonInformationCard-personsFetchFailed' }),
                        iconName: 'error',
                        iconColor: '#D42828'
                    });
                }
            }
        };

        fetchData();
    }, [getItem, getEthosQuery, intl, setErrorMessage, setLoadingStatus, storeItem]);

    // Lambda function for fetching courses by Banner ID
    async function sendBannerIdToLambda(bannerId) {
        if (!bannerId) {
            console.warn("Attempted to send an undefined bannerId to Lambda");
            return;
        }

        const endpoint = `https://rmha5bol53.execute-api.us-east-2.amazonaws.com/default/canvas-api-handler?bannerId=${bannerId}`;
        // Log the request
        console.log('Sending request to Lambda with bannerId:', bannerId);

        try {
            const response = await fetch(endpoint, { method: 'GET' });
            if (!response.ok) {
                const responseBody = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Body: ${responseBody}`);
            }

            const responseData = await response.json();
            console.log('Received data from Lambda:', responseData);

            // Validate that 'courses' and 'terms' are arrays
            const courses = Array.isArray(responseData.courses) ? responseData.courses : [];
            const terms = Array.isArray(responseData.terms) ? responseData.terms : [];

            if (terms.length > 0) {
                const currentTerms = getCurrentTerm(terms);
                if (currentTerms.length > 0) {
                    const filteredCourses = courses.filter(course => currentTerms.some(term => term.id === course.enrollment_term_id));
                    setCanvasData(filteredCourses);
                    // Log filtered courses
                    console.log('Filtered courses for current term:', filteredCourses);
                } else {
                    console.warn("No current term found.");
                }
            } else {
                console.warn("No terms found in response data.");
            }
        } catch (error) {
            console.error("Error sending bannerId to Lambda:", error);
        }
    }

    useEffect(() => {
        if (persons.length > 0) {
            const person = persons[currentPersonIndex];
            const bannerId = person.credentials.find(cred => cred.type === 'bannerId')?.value;
            console.log("Banner ID for person:", bannerId);
            if (bannerId) {
                sendBannerIdToLambda(bannerId);
            } else {
                console.warn("No Banner ID found for this user");
            }
        } else {
            console.warn('No persons found');
        }
    }, [persons, currentPersonIndex]);

    return (
        <Fragment>
            {persons.length > 0 ? (
                <div className={classes.card}>
                    <div className={classes.disclaimer}>
                        Disclaimer: These are unofficial grades, official grades are available through the Registrar&apos;s Office.
                    </div>
                    {canvasData.length > 0 ? (
                        <Fragment>
                            <Table striped bordered hover>
                                <TableBody>
                                    {canvasData.sort(sortCoursesByDate).slice(0, 20).map(course => (
                                        <TableRow key={course.id}>
                                            <TableCell style={columnStyles}>
                                                {course.name} - {course.enrollments[0]?.computed_current_score || 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className={classes.buttonContainer}>
                                <Button href="https://canvas.uiw.edu/courses" target="_blank">Go to Canvas</Button>
                            </div>
                        </Fragment>
                    ) : (
                        <div>
                            {/* Courses error handling */}
                            <p>No courses found for the current term.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className={classes.text}>
                    {/* No persons error handling */}
                    <p>No user information found. Please contact support.</p>
                </div>
            )}
        </Fragment>
    );
};

CanvasCard.propTypes = {
    cardControl: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    cache: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired
};

function CanvasCardWrapper(props) {
    return (
        <IntlProvider locale="en">
            <CanvasCard {...props} />
        </IntlProvider>
    );
}

export default withStyles(styles)(CanvasCardWrapper);