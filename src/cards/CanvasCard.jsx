import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink } from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';
import React from 'react';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    }
});

const Canvascard = (props) => {
    const { classes } = props;

    return (
        <div className={classes.card}>
            <Typography variant="h2">
                Hello CanvasCard World
            </Typography>
            <Typography>
                <span>
                    For sample extensions, visit the Ellucian Developer
                </span>
                <TextLink href="https://github.com/ellucian-developer/experience-extension-sdk-samples" target="_blank">
                     GitHub
                </TextLink>
            </Typography>
        </div>
    );
};

Canvascard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Canvascard);