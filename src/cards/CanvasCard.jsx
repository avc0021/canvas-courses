// import React, { useEffect, useState, Fragment } from 'react';
// import { Table, TableBody, TableCell, TableRow, Button } from '@ellucian/react-design-system/core';
// import { spacing40, spacing10 } from '@ellucian/react-design-system/core/styles/tokens';
// import { withStyles } from '@ellucian/react-design-system/core/styles';
// import PropTypes from 'prop-types';
// import { useIntl, IntlProvider } from 'react-intl';

// // Styles for the courses
// const columnStyles = {
//     height: '100%',
//     marginTop: 0,
//     marginRight: spacing40,
//     marginBottom: spacing10,
//     marginLeft: spacing40,
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'space-around'
// };


// // Styles for the card
// const styles = () => ({
//     card: {
//         height: '90%',
//         marginRight: spacing40,
//         marginLeft: spacing40,
//         paddingBottom: spacing10
//     },
//     text: {
//         marginRight: spacing40,
//         marginLeft: spacing40
//     },
//     buttonContainer: {
//         marginTop: spacing10,
//         marginBottom: spacing10,
//         paddingBottom: spacing40
//     }
// });

// const cacheKey = 'graphql-card:persons';

// function isThisYear(date) {
//     const courseYear = new Date(date).getFullYear();
//     const currentYear = new Date().getFullYear();
//     return courseYear === currentYear;
// }

// function sortCoursesByDate(a, b) {
//     if (isThisYear(a.created_at) && !isThisYear(b.created_at)) {
//         return -1;
//     }
//     if (!isThisYear(a.created_at) && isThisYear(b.created_at)) {
//         return 1;
//     }

//     const dateA = new Date(a.created_at);
//     const dateB = new Date(b.created_at);
//     return dateB - dateA;
// }

// // CanvasCard component
// const CanvasCard = (props) => {
//     const {
//         classes,
//         cardControl: { setLoadingStatus, setErrorMessage },
//         data: { getEthosQuery },
//         cache: { getItem, storeItem }
//     } = props;

//     const intl = useIntl();
//     const [persons, setPersons] = useState();
//     const [canvasData, setCanvasData] = useState([]);


//     useEffect(() => {
//         (async () => {
//             setLoadingStatus(true);
//             const { data: cachedData, expired: cachedDataExpired = true } = await getItem({ key: cacheKey });

//             if (cachedData) {
//                 setLoadingStatus(false);
//                 setPersons(() => cachedData);
//             }

//             if (cachedDataExpired || cachedData === undefined) {
//                 try {
//                     const personsData = await getEthosQuery({ queryId: 'list-persons' });
//                     const { data: { persons: { edges: personEdges } = [] } = {} } = personsData;
//                     const persons = personEdges.map(edge => edge.node);
//                     setPersons(() => persons);
//                     storeItem({ key: cacheKey, data: persons });
//                     setLoadingStatus(false);
//                 } catch (error) {
//                     console.error('ethosQuery failed', error);
//                     setErrorMessage({
//                         headerMessage: intl.formatMessage({ id: 'PersonInformationCard-fetchFailed' }),
//                         textMessage: intl.formatMessage({ id: 'PersonInformationCard-personsFetchFailed' }),
//                         iconName: 'error',
//                         iconColor: '#D42828'
//                     });
//                 }
//             }
//         })();
//     }, [getItem, getEthosQuery, intl, setErrorMessage, setLoadingStatus, storeItem]);

//     async function sendBannerIdToLambda(bannerId) {
//         if (!bannerId) {
//             console.warn("Attempted to send an undefined bannerId to Lambda");
//             return;
//         }
//         console.log(`Sending bannerId to Lambda: ${bannerId}`);

//         // Add the bannerId as a query parameter to the endpoint URL
//         const endpoint = `https://rmha5bol53.execute-api.us-east-2.amazonaws.com/default/canvas-api-handler?bannerId=${bannerId}`;

//         try {
//             const response = await fetch(endpoint, {
//                 method: 'GET'
//             });

//             if (!response.ok) {
//                 const responseBody = await response.text();
//                 throw new Error(`HTTP error! Status: ${response.status}, Body: ${responseBody}`);
//             }

//             const responseData = await response.json();

//             setCanvasData(prevData => {
//                 // Filter out courses that already exist in the prevData based on some unique identifier like `id`
//                 const newCourses = responseData.filter(course => !prevData.some(pCourse => pCourse.id === course.id));

//                 return [...prevData, ...newCourses];
//             });
//         } catch (error) {
//             console.error("Error sending bannerId to Lambda:", error);
//         }
//     }

//     useEffect(() => {
//         if (persons && persons.length > 0) {
//             persons.forEach(person => {
//                 const bannerId = person.credentials.filter((cred) => cred.type === 'bannerId')[0]?.value;
//                 sendBannerIdToLambda(bannerId);
//             });
//         }
//     }, [persons]);

//     return (
//         <Fragment>
//             {persons && (
//                 <div className={classes.card}>
//                     {persons.map((person) => {
//                         const bannerId = person.credentials.filter((cred) => cred.type === 'bannerId')[0]?.value;
//                         return (
//                             <Fragment key={person.id}>
//                                 {canvasData.length > 0 ? (
//                                     <Fragment>
//                                         <Table striped bordered hover>
//                                             <TableBody>
//                                                 {canvasData.sort(sortCoursesByDate).slice(0, 20).map(course => (
//                                                     <TableRow key={course.id}>
//                                                         <TableCell style={columnStyles}>
//                                                             {course.name} - {course.enrollments[0]?.computed_current_score || 'N/A'}
//                                                         </TableCell>
//                                                     </TableRow>
//                                                 ))}
//                                             </TableBody>
//                                         </Table>
//                                         <div className={classes.buttonContainer}>
//                                             <Button href="https://canvas.uiw.edu/courses" target="_blank">Go to Canvas</Button>
//                                         </div>
//                                     </Fragment>
//                                 ) : (
//                                     <div>
//                                         <p>We apologize for the inconvenience. There seems to be an issue.</p>
//                                         <p>Please email <a href="mailto:webteam@uiwtx.edu">webteam@uiwtx.edu</a> with the following information:</p>
//                                         <ul>
//                                             <li>A screenshot of the issue you&apos;re facing.</li>
//                                             <li>The device you are using.</li>
//                                             <li>The browser you are on.</li>
//                                             <li>Any other information you think might be useful.</li>
//                                         </ul>
//                                     </div>
//                                 )}
//                             </Fragment>
//                         );
//                     })}
//                 </div>
//             )}
//             {!persons && (
//                 <div className={classes.text}>
//                     {intl.formatMessage({ id: 'PersonInformationCard-noSelectedPerson' })}
//                 </div>
//             )}
//         </Fragment>
//     );
// };

// CanvasCard.propTypes = {
//     cardControl: PropTypes.object.isRequired,
//     classes: PropTypes.object.isRequired,
//     cache: PropTypes.object.isRequired,
//     data: PropTypes.object.isRequired
// };

// function CanvasCardWrapper(props) {
//     return (
//         <IntlProvider locale="en">
//             <CanvasCard {...props} />
//         </IntlProvider>
//     );
// }

// export default (withStyles(styles)(CanvasCardWrapper));

import React, { useEffect, useState, Fragment } from 'react';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import PropTypes from 'prop-types';
import { useIntl, IntlProvider } from 'react-intl';
import { Button } from '@ellucian/react-design-system/core';

// Styles configuration
const styles = () => ({
    card: {
        margin: '20px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '10px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    courseRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '10px 0',
        borderBottom: '1px solid #eee'
    },
    gradeCircle: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '16px'
    },
    gradeA: {
        backgroundColor: '#4CAF50',
        color: '#fff'
    },
    gradeB: {
        backgroundColor: '#FFEB3B',
        color: '#333'
    },
    gradeF: {
        backgroundColor: '#F44336',
        color: '#fff'
    },
    buttonContainer: {
        marginTop: '20px',
        width: '100%',
        textAlign: 'center'
    }
});

const getGradeClass = (score) => {
    if (score >= 90) {
        return 'gradeA';
    } else if (score >= 80) {
        return 'gradeB';
    } else {
        return 'gradeF';
    }
};

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
            const { data: cachedData, expired: cachedDataExpired = true } = await getItem({ key: 'graphql-card:persons' });

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
                    storeItem({ key: 'graphql-card:persons', data: persons });
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
                const newCourses = responseData.filter(course => !prevData.some(pCourse => pCourse.id === course.id));
                return [...prevData, ...newCourses.sort(sortCoursesByDate)];
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

    const renderGradeCircle = (score) => {
        let grade;
        let gradeClass;

        if (score >= 90) {
            grade = 'A';
            gradeClass = classes.gradeA;
        } else if (score >= 80) {
            grade = 'B';
            gradeClass = classes.gradeB;
        } else {
            grade = 'F';
            gradeClass = classes.gradeF;
        }
        return <div className={`${classes.gradeCircle} ${gradeClass}`}>{grade}</div>;
    };

    return (
        <Fragment>
            {persons && (
                <div className={classes.card}>
                    {canvasData.length > 0 ? (
                        <Fragment>
                            {canvasData.map(course => (
                                <div key={course.id} className={classes.courseRow}>
                                    <span>{course.name}</span>
                                    {renderGradeCircle(course.enrollments[0]?.computed_current_score)}
                                </div>
                            ))}
                            <div className={classes.buttonContainer}>
                                <Button href="https://canvas.uiw.edu/courses" target="_blank">Go to Canvas</Button>
                            </div>
                        </Fragment>
                    ) : (
                        <div>
                            <p>We apologize for the inconvenience. There seems to be an issue.</p>
                            <p>Please email <a href="mailto:webteam@uiwtx.edu">webteam@uiwtx.edu</a> with the following information:</p>
                            <ul>
                                <li>A screenshot of the issue you are facing.</li>
                                <li>The device you are using.</li>
                                <li>The browser you are on.</li>
                                <li>Any other information you think might be useful.</li>
                            </ul>
                        </div>
                    )}
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

export default withStyles(styles)(CanvasCardWrapper);
