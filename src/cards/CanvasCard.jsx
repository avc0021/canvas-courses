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

// // Utility functions for filtering courses
// function isThisYear(date) {
//     const courseYear = new Date(date).getFullYear();
//     const currentYear = new Date().getFullYear();
//     return courseYear === currentYear;
// }

// function sortCoursesByDate(a, b) {
//     const dateA = new Date(a.created_at);
//     const dateB = new Date(b.created_at);
//     return dateB - dateA;
// }

// // Function to get the current term based on the date
// function getCurrentTerm(terms) {
//     const currentDate = new Date();

//     // Define term ranges
//     // August 1st
//     const fallStart = new Date(currentDate.getFullYear(), 7, 1);
//     // December 31st
//     const fallEnd = new Date(currentDate.getFullYear(), 11, 31);
//     // January 1st
//     const springStart = new Date(currentDate.getFullYear(), 0, 1);
//     // May 14th
//     const springEnd = new Date(currentDate.getFullYear(), 4, 14);
//     // May 15th
//     const summerStart = new Date(currentDate.getFullYear(), 4, 15);
//     // July 31st
//     const summerEnd = new Date(currentDate.getFullYear(), 6, 31);

//     // Determine the current term based on the current date
//     if (currentDate >= fallStart && currentDate <= fallEnd) {
//         return terms.filter(term => {
//             const startDate = new Date(term.start_at);
//             const endDate = new Date(term.end_at);
//             return startDate.getMonth() >= 7 && endDate.getMonth() <= 11 && startDate.getFullYear() === currentDate.getFullYear();
//         });
//     } else if (currentDate >= springStart && currentDate <= springEnd) {
//         return terms.filter(term => {
//             const startDate = new Date(term.start_at);
//             const endDate = new Date(term.end_at);
//             return startDate.getMonth() >= 0 && endDate.getMonth() <= 4 && startDate.getFullYear() === currentDate.getFullYear();
//         });
//     } else if (currentDate >= summerStart && currentDate <= summerEnd) {
//         return terms.filter(term => {
//             const startDate = new Date(term.start_at);
//             const endDate = new Date(term.end_at);
//             return startDate.getMonth() >= 4 && endDate.getMonth() <= 6 && startDate.getFullYear() === currentDate.getFullYear();
//         });
//     } else {
//         return [];
//     }
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
//     const [persons, setPersons] = useState([]);
//     const [canvasData, setCanvasData] = useState([]);
//     const [currentTermCourses, setCurrentTermCourses] = useState([]);
//     // Multi-user handling
//     const [currentPersonIndex, setCurrentPersonIndex] = useState(0);

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoadingStatus(true);
//             const { data: cachedData, expired: cachedDataExpired = true } = await getItem({ key: cacheKey });

//             if (cachedData) {
//                 setPersons(cachedData);
//                 setLoadingStatus(false);
//             }

//             if (cachedDataExpired || cachedData === undefined) {
//                 try {
//                     const personsData = await getEthosQuery({ queryId: 'list-persons' });
//                     const { data: { persons: { edges: personEdges } = [] } = {} } = personsData;
//                     const persons = personEdges.map(edge => edge.node);
//                     setPersons(persons);
//                     storeItem({ key: cacheKey, data: persons });
//                     setLoadingStatus(false);
//                 } catch (error) {
//                     console.error('EthosQuery failed', error);
//                     setErrorMessage({
//                         headerMessage: intl.formatMessage({ id: 'PersonInformationCard-fetchFailed' }),
//                         textMessage: intl.formatMessage({ id: 'PersonInformationCard-personsFetchFailed' }),
//                         iconName: 'error',
//                         iconColor: '#D42828'
//                     });
//                 }
//             }
//         };

//         fetchData();
//     }, [getItem, getEthosQuery, intl, setErrorMessage, setLoadingStatus, storeItem]);

//     async function sendBannerIdToLambda(bannerId) {
//         if (!bannerId) {
//             console.warn("Attempted to send an undefined bannerId to Lambda");
//             return;
//         }

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
//             const { courses, terms } = responseData;

//             const currentTerms = getCurrentTerm(terms);
//             if (currentTerms.length > 0) {
//                 const filteredCourses = courses.filter(course => currentTerms.some(term => term.id === course.enrollment_term_id));
//                 setCanvasData(filteredCourses);
//             } else {
//                 console.warn("No current term found.");
//             }
//         } catch (error) {
//             console.error("Error sending bannerId to Lambda:", error);
//         }
//     }

//     useEffect(() => {
//         // Handle multiple users by cycling through the list
//         if (persons.length > 0) {
//             const person = persons[currentPersonIndex];
//             const bannerId = person.credentials.find(cred => cred.type === 'bannerId')?.value;
//             if (bannerId) {
//                 sendBannerIdToLambda(bannerId);
//             }
//         }
//     }, [persons, currentPersonIndex]);

//     return (
//         <Fragment>
//             {persons.length > 0 && (
//                 <div className={classes.card}>
//                     {persons.map((person, index) => (
//                         <Fragment key={person.id}>
//                             {canvasData.length > 0 ? (
//                                 <Fragment>
//                                     <Table striped bordered hover>
//                                         <TableBody>
//                                             {canvasData.sort(sortCoursesByDate).slice(0, 20).map(course => (
//                                                 <TableRow key={course.id}>
//                                                     <TableCell style={columnStyles}>
//                                                         {course.name} - {course.enrollments[0]?.computed_current_score || 'N/A'}
//                                                     </TableCell>
//                                                 </TableRow>
//                                             ))}
//                                         </TableBody>
//                                     </Table>
//                                     <div className={classes.buttonContainer}>
//                                         <Button href="https://canvas.uiw.edu/courses" target="_blank">Go to Canvas</Button>
//                                     </div>
//                                 </Fragment>
//                             ) : (
//                                 <div>
//                                     <p>We apologize for the inconvenience. There seems to be an issue.</p>
//                                     <p>Please email <a href="mailto:webteam@uiwtx.edu">webteam@uiwtx.edu</a> with the following information:</p>
//                                     <ul>
//                                         <li>A screenshot of the issue you&apos;re facing.</li>
//                                         <li>The device you are using.</li>
//                                         <li>The browser you are on.</li>
//                                         <li>Any other information you think might be useful.</li>
//                                     </ul>
//                                 </div>
//                             )}
//                         </Fragment>
//                     ))}
//                 </div>
//             )}
//             {!persons.length && (
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

import React, { useEffect, useState, Fragment } from 'react';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import PropTypes from 'prop-types';
import { useIntl, IntlProvider } from 'react-intl';
import { TextLink } from '@ellucian/react-design-system/core';

// Styles configuration
const styles = () => ({
    card: {
        marginLeft: '20px',
        marginRight: '20px',
        paddingLeft: '20px',
        paddingRight: '20px',
        borderRadius: '10px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px'
    },
    courseRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '10px 0',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px'
    },
    gradeCircle: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
        flexShrink: 0,
        fontFamily: 'Arial, sans-serif',
        border: '2px solid #000'
    },
    courseNameContainer: {
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px'
    },
    courseName: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: '14px',
        color: '#000',
        textDecoration: 'none',
        fontFamily: 'Arial, sans-serif'
    },
    link: {
        textDecoration: 'none',
        color: '#000',
        '&:hover': {
            color: '#aa1010',
            textDecoration: 'none'
        },
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px'
    },
    disclaimer: {
        fontStyle: 'italic',
        marginBottom: '10px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px'
    }
});

function getCurrentTerm(terms) {
    const currentDate = new Date();

    // Define the term ranges
    // August 1st
    const fallStart = new Date(currentDate.getFullYear(), 7, 1);
    // December 31st
    const fallEnd = new Date(currentDate.getFullYear(), 11, 31);
    // January 1st
    const springStart = new Date(currentDate.getFullYear(), 0, 1);
    // May 31st
    const springEnd = new Date(currentDate.getFullYear(), 4, 31);
    // May 1st
    const summerStart = new Date(currentDate.getFullYear(), 4, 1);
    // July 31st
    const summerEnd = new Date(currentDate.getFullYear(), 6, 31);

    // Determine the current term based on the current date
    if (currentDate >= fallStart && currentDate <= fallEnd) {
        return terms.filter(term => {
            const startDate = new Date(term.start_at);
            const endDate = new Date(term.end_at);
            return (
                // August
                startDate.getMonth() >= 7 &&
                // December
                endDate.getMonth() <= 11 &&
                startDate.getFullYear() === currentDate.getFullYear()
            );
        });
    } else if (currentDate >= springStart && currentDate <= springEnd) {
        return terms.filter(term => {
            const startDate = new Date(term.start_at);
            const endDate = new Date(term.end_at);
            return (
                // January
                startDate.getMonth() >= 0 &&
                // May
                endDate.getMonth() <= 4 &&
                startDate.getFullYear() === currentDate.getFullYear()
            );
        });
    } else if (currentDate >= summerStart && currentDate <= summerEnd) {
        return terms.filter(term => {
            const startDate = new Date(term.start_at);
            const endDate = new Date(term.end_at);
            return (
                // May
                startDate.getMonth() >= 4 &&
                // July
                endDate.getMonth() <= 6 &&
                startDate.getFullYear() === currentDate.getFullYear()
            );
        });
    } else {
        return [];
    }
}

const CanvasCard = (props) => {
    const {
        classes,
        cardControl: { setLoadingStatus, setErrorMessage }
    } = props;

    const intl = useIntl();
    const [canvasData, setCanvasData] = useState([]);

    useEffect(() => {
        console.log("Component mounted, calling sendHardcodedBannerIdToLambda");
        sendHardcodedBannerIdToLambda();
    }, []);

    async function sendHardcodedBannerIdToLambda() {
        const hardcodedBannerId = 'W01242266';
        console.log(`Sending hardcoded bannerId to Lambda: ${hardcodedBannerId}`);

        const endpoint = `https://rmha5bol53.execute-api.us-east-2.amazonaws.com/default/canvas-api-handler?bannerId=${hardcodedBannerId}`;

        try {
            const response = await fetch(endpoint, { method: 'GET' });
            console.log("Response from Lambda received");

            if (!response.ok) {
                const responseBody = await response.text();
                console.error(`HTTP error! Status: ${response.status}, Body: ${responseBody}`);
                throw new Error(`HTTP error! Status: ${response.status}, Body: ${responseBody}`);
            }

            const data = await response.json();
            console.log("Full response from Lambda:", JSON.stringify(data, null, 2));

            const { courses, terms } = data;

            if (!terms || !Array.isArray(terms)) {
                console.error("Terms data is missing or not an array:", terms);
                return;
            }

            // Dynamically find the current term based on the date
            const currentTerms = getCurrentTerm(terms);

            if (!currentTerms.length) {
                console.warn("No current term found for the current date");
                return;
            }

            // Filter courses by the current term IDs
            const filteredCourses = courses.filter(course => currentTerms.some(term => term.id === course.enrollment_term_id));

            console.log("Filtered courses:", filteredCourses);

            // Update canvasData state with the filtered courses
            setCanvasData(filteredCourses);

        } catch (error) {
            console.error("Error sending bannerId to Lambda:", error);
        }
    }

    const renderGradeCircle = (score) => {
        let displayScore = 'NA';
        if (score >= 1 && score <= 100) {
            displayScore = Math.floor(score);
        }
        return <div className={classes.gradeCircle}>{displayScore}</div>;
    };

    return (
        <Fragment>
            {canvasData.length > 0 ? (
                <div className={classes.card}>
                    <div className={classes.disclaimer}>
                        Disclaimer: These are unofficial grades, official grades are available through the Registrar&apos;s Office.
                    </div>
                    {/* Render all courses */}
                    {canvasData.map(course => (
                        <div key={course.id} className={classes.courseRow}>
                            <div className={classes.courseNameContainer}>
                                <TextLink
                                    id="textlink-target"
                                    target="_blank"
                                    href="https://canvas.uiw.edu/courses"
                                    className={classes.link}
                                    onMouseEnter={(e) => e.target.classList.add(classes.textLinkHover)}
                                    onMouseLeave={(e) => e.target.classList.remove(classes.textLinkHover)}>
                                    <span className={classes.courseName}>{course.name}</span>
                                </TextLink>
                            </div>
                            {renderGradeCircle(course.enrollments[0]?.computed_current_score)}
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <p>There are no items at this time.</p>
                </div>
            )}
        </Fragment>
    );
};

CanvasCard.propTypes = {
    cardControl: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
};

function CanvasCardWrapper(props) {
    return (
        <IntlProvider locale="en">
            <CanvasCard {...props} />
        </IntlProvider>
    );
}

export default withStyles(styles)(CanvasCardWrapper);