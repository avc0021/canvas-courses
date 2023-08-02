import React, { useEffect, useState } from "react";
import { Button, makeStyles } from "@ellucian/react-design-system/core";
import {
  spacing40,
  spacing30
} from "@ellucian/react-design-system/core/styles/tokens";

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

  const handleButtonClick = () => {
    const authUrl = `https://canvas.uiw.edu/login/oauth2/auth?client_id=139460000000000141&response_type=code&redirect_uri=https%3A%2F%2Fexperience-test.elluciancloud.com%2Fuotiwtest%2F&scope=url%3AGET%7C%2Fapi%2Fv1%2Fcourses`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      fetch(`https://rmha5bol53.execute-api.us-east-2.amazonaws.com/default/canvas-api-handler?code=${code}`)
        .then((response) => {
          if (!response.ok) {
            // Return response so we can access the body in the catch block
            return Promise.reject(response);
          }
          return response.json();
        })
        .then((data) => {
          if (data && data.access_token) {
            setAccessToken(data.access_token);
          } else {
            console.error('The response object or the access_token is undefined.');
          }
        })
        .catch((errorResponse) => {
          // Parse the JSON from the response
          errorResponse.json().then((error) => {
            console.error('There was an error with the fetch operation:', error.errorMessage);
          }).catch((error) => {
            console.error('There was an error with the fetch operation:', error);
          });
        });

      urlParams.delete("code");
      window.history.replaceState({}, "", `${window.location.pathname}?${urlParams}`);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetch(`https://rmha5bol53.execute-api.us-east-2.amazonaws.com/default/canvas-api-handler?token=${accessToken}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => setData(data))
        .catch((error) => console.error('There was an error with the fetch operation:', error));
    }
  }, [accessToken]);

  return (
    <div>
      {!accessToken && (
        <Button color="secondary" onClick={handleButtonClick} className={classes.canvasLogin}>
          Log in
        </Button>
      )}
      {accessToken && !data && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

export default App;
