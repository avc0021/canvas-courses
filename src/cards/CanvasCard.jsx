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
            // console.log("Full response from Lambda:", JSON.stringify(data, null, 2));

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