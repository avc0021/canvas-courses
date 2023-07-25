import React, { useEffect, useState } from 'react';
import { Button, makeStyles } from '@ellucian/react-design-system/core';
import { spacing40, spacing30 } from '@ellucian/react-design-system/core/styles/tokens'

// Utility function to parse the authorization code from the URL
function getCodeFromURL() {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get('code');
}

// Add your styles here
const useStyles = makeStyles((theme) => ({
  canvasLogin: {
    marginLeft: spacing40,
    marginTop: spacing30
  }
}));

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [data, setData] = useState(null);
  const classes = useStyles();

  useEffect(() => {
    // Get the authorization code from the URL
    const code = getCodeFromURL();

    // If there is a code in the URL, we've just been redirected from the authorization server
    if (code) {
      // Make a POST request to exchange our authorization code for an access token
      fetch('https://canvas.instructure.com/login/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          ClientId: '139460000000000141',
          redirectUri: 'https://experience-test.elluciancloud.com/uotiwtest/',
          clientSecret: 'MXfTiOCMvxHtg7NEJ5ce8TIRs44EpaAoaX33HwtYWkvP5kOlUTGM7yRzQnGr3Za3',
          code,
          grantType: 'authorization_code'
        })
      })
        .then((res) => res.json())
        .then((json) => {
          // Store the access token in the state
          setAccessToken(json.access_token);
        })
        .catch((err) => console.error('Error:', err));
    }
  }, []);

  // Once we have the access token, we can use it to make authenticated requests to the API
  useEffect(() => {
    if (accessToken) {
      fetch('https://canvas.instructure.com/api/v1/accounts/ACCOUNT_ID/analytics/current/statistics', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then((res) => res.json())
        .then((json) => {
          // Store the data from the API in the state
          setData(json);
        })
        .catch((err) => console.error('Error:', err));
    }
  }, [accessToken]);

  // If we don't have an access token yet, display the link to the authorization server
  if (!accessToken) {
    return (
      <Button
        className={classes.canvasLogin}
        color='secondary'
        onClick={() => {
          window.location.href = `https://canvas.instructure.com/login/oauth2/auth?client_id=139460000000000141&response_type=code&redirect_uri=https://experience-test.elluciancloud.com/uotiwtest/&scope=url:GET|/api/v1/accounts/:account_id/analytics/current/statistics`;
        }}
      >
        Log in
      </Button>
    );
  }

  // If we have an access token but no data yet, display a loading message
  if (!data) {
    return <p>Loading...</p>;
  }

  // If we have data, display it
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default App;