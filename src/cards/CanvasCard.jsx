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
    marginBottom: 0,
    marginLeft: spacing40,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around'
};


// // Styles for the card
const styles = () => ({
    card: {
        marginRight: spacing40,
        marginLeft: spacing40,
        paddingTop: spacing10
    },
    text: {
        marginRight: spacing40,
        marginLeft: spacing40
    }
});

const cacheKey = 'graphql-card:persons';

function isThisYear(date) {
    const courseYear = new Date(date).getFullYear();
    const currentYear = new Date().getFullYear();
    return courseYear === currentYear;
}

function sortCoursesByDate(a, b) {
    if (isThisYear(a.created_at) && !isThisYear(b.created_at)) {
        return -1;
    }
    if (!isThisYear(a.created_at) && isThisYear(b.created_at)) {
        return 1;
    }

    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA;
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
    const [persons, setPersons] = useState();
    const [canvasData, setCanvasData] = useState([]);


    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            const { data: cachedData, expired: cachedDataExpired = true } = await getItem({ key: cacheKey });

            if (cachedData) {
                setLoadingStatus(false);
                setPersons(() => cachedData);
            }

            if (cachedDataExpired || cachedData === undefined) {
                try {
                    const personsData = await getEthosQuery({ queryId: 'list-persons' });
                    const { data: { persons: { edges: personEdges } = [] } = {} } = personsData;
                    const persons = personEdges.map(edge => edge.node);
                    setPersons(() => persons);
                    storeItem({ key: cacheKey, data: persons });
                    setLoadingStatus(false);
                } catch (error) {
                    console.error('ethosQuery failed', error);
                    setErrorMessage({
                        headerMessage: intl.formatMessage({ id: 'PersonInformationCard-fetchFailed' }),
                        textMessage: intl.formatMessage({ id: 'PersonInformationCard-personsFetchFailed' }),
                        iconName: 'error',
                        iconColor: '#D42828'
                    });
                }
            }
        })();
    }, [getItem, getEthosQuery, intl, setErrorMessage, setLoadingStatus, storeItem]);

    async function sendBannerIdToLambda(bannerId) {
        if (!bannerId) {
            console.warn("Attempted to send an undefined bannerId to Lambda");
            return;
        }
        console.log(`Sending bannerId to Lambda: ${bannerId}`);

        // Add the bannerId as a query parameter to the endpoint URL
        const endpoint = `https://rmha5bol53.execute-api.us-east-2.amazonaws.com/default/canvas-api-handler?bannerId=${bannerId}`;

        try {
            const response = await fetch(endpoint, {
                method: 'GET'
            });

            if (!response.ok) {
                const responseBody = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Body: ${responseBody}`);
            }

            const responseData = await response.json();

            setCanvasData(prevData => {
                // Filter out courses that already exist in the prevData based on some unique identifier like `id`
                const newCourses = responseData.filter(course => !prevData.some(pCourse => pCourse.id === course.id));

                return [...prevData, ...newCourses];
            });
        } catch (error) {
            console.error("Error sending bannerId to Lambda:", error);
        }
    }

    useEffect(() => {
        if (persons && persons.length > 0) {
            persons.forEach(person => {
                const bannerId = person.credentials.filter((cred) => cred.type === 'bannerId')[0]?.value;
                sendBannerIdToLambda(bannerId);
            });
        }
    }, [persons]);

    return (
        <Fragment>
            {persons && (
                <div className={classes.card}>
                    {persons.map((person) => {
                        const bannerId = person.credentials.filter((cred) => cred.type === 'bannerId')[0]?.value;

                        return (
                            <Fragment key={person.id}>
                                {canvasData.length > 0 ? (
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
                                ) : (
                                    <div className={classes.text}>
                                        Opportunity starts here!
                                        <div style={{ marginTop: '20px' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                href="https://www.uiw.edu/admissions/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Enroll Now
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Fragment>
                        );
                    })}
                </div>
            )}
            {!persons && (
                <div className={classes.text}>
                    {intl.formatMessage({ id: 'PersonInformationCard-noSelectedPerson' })}
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

export default (withStyles(styles)(CanvasCardWrapper));
