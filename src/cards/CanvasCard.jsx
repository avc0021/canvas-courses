// get canvas data using random student account
// import React, { useEffect, useState } from 'react';
// import { Table, TableBody, TableCell, TableRow } from '@ellucian/react-design-system/core'
// import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';

// const columnStyles = {
//   // textAlign: 'center',
//   // verticalAlign: 'middle'
//   height: '100%',
//   marginTop: 0,
//   marginRight: spacing40,
//   marginBottom: 0,
//   marginLeft: spacing40,
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'space-around'
// };

// const CanvasCourses = () => {
//   const [courses, setCourses] = useState([]);

//   useEffect(() => {
//     fetch('https://rmha5bol53.execute-api.us-east-2.amazonaws.com/default/canvas-api-handler', {
//       method: 'GET'
//     })
//     .then(response => {
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
//       return response.json();
//     })
//     .then(data => setCourses(data))
//     .catch(error => console.error('Error fetching data:', error));
//   }, []);

//   return (
//   <div>
//   <Table striped bordered hover>
//     <TableBody>
//       {courses.map(course => (
//         <TableRow key={course.id}>
//           {/* <TableCell style={columnStyles}>Course: {course.name}</TableCell> */}
//           <TableCell style={columnStyles}>{course.name} - {course.enrollments[0]?.computed_current_score || 'N/A'}</TableCell>
//         </TableRow>
//       ))}
//     </TableBody>
//   </Table>
// </div>
// )
// };

// export default CanvasCourses;


// to get bannerId
// import React, { Fragment, useEffect, useState } from 'react';
// import { Table, TableRow, TableCell, TableBody } from '@ellucian/react-design-system/core';
// import { withStyles } from '@ellucian/react-design-system/core/styles';
// import { spacing10, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
// import PropTypes from 'prop-types';
// import { useIntl, IntlProvider } from 'react-intl';


// const styles = () => ({
//     card: {
//         marginRight: spacing40,
//         marginLeft: spacing40,
//         paddingTop: spacing10
//     },
//     text: {
//         marginRight: spacing40,
//         marginLeft: spacing40
//     }
// });

// const cacheKey = 'graphql-card:persons';

// const CanvasCard = (props) => {
//     const {
//         classes,
//         cardControl: {
//             setLoadingStatus,
//             setErrorMessage
//         },
//         data: { getEthosQuery },
//         cache: { getItem, storeItem }
//     } = props;
//     const intl = useIntl();
//     const [persons, setPersons] = useState();
//     console.log(persons)

//     useEffect(() => {
//         console.log("Inside useEffect");
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
//                     console.log("Fetched Data:", personsData);
//                     const { data: { persons: { edges: personEdges } = [] } = {} } = personsData;
//                     const persons = personEdges.map(edge => edge.node);
//                     setPersons(() => persons);
//                     console.log(persons)
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

//     return (
//         <Fragment>
//             {persons && (
//                 <div className={classes.card}>
//                     {persons.map((person) => {
//                         console.log("Rendering person with id:", person.id);
//                         const bannerId = person.credentials.filter((cred) => cred.type === 'bannerId')[0]?.value;
//                         return (
//                             <Table key={person.id} stickyHeader className={classes.table}>
//                                 <TableBody>
//                                     <TableRow>
//                                         <TableCell>Banner Id:</TableCell>
//                                         <TableCell align="Left">{bannerId}</TableCell>
//                                     </TableRow>
//                                 </TableBody>
//                             </Table>
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

function sortCoursesByDate(a, b) {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);

    // Descending order (most recent to oldest)
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
                                {/* <Table stickyHeader className={classes.table}>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Banner Id:</TableCell>
                                            <TableCell align="Left">{bannerId}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table> */}
                                {canvasData.length > 0 ? (
                                    <Table striped bordered hover>
                                        <TableBody>
                                            {/* Sort the canvasData before mapping over it */}
                                            {canvasData.sort(sortCoursesByDate).map(course => (
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
