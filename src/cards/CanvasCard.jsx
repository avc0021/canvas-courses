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
        boxShadow: '0.5rem 0.5rem black, -0.5rem -0.5rem #f4f4f4',
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
    buttonContainer: {
        marginTop: '20px',
        width: '100%',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px'
    },
    textLinkHover: {
        color: '#aa1010',
        textDecoration: 'none !important',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px'
    }
});

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
        const endpoint = `https://ejfyvqe5ch.execute-api.us-east-2.amazonaws.com/default/canvas_grades?bannerId=${bannerId}`;

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
        let displayScore = 'NA';
        if (score >= 1 && score <= 100) {
            displayScore = Math.floor(score);
        }
        return <div className={classes.gradeCircle}>{displayScore}</div>;
    };

    return (
        <Fragment>
            {persons && (
                <div className={classes.card}>
                    {canvasData.length > 0 ? (
                        <Fragment>
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
                        </Fragment>
                    ) : (
                        <div>
                            <p>There is no data to show, but if you feel this is an error, please contact <a href="mailto:webteam@uiwtx.edu">webteam@uiwtx.edu</a> and provide a screenshot or any other information you think might be useful.</p>
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
