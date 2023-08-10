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
    const authUrl = `https://canvas.uiw.edu/login/oauth2/auth?client_id=139460000000000141&response_type=code&redirect_uri=https://experience-test.elluciancloud.com/uotiwtest/&scope=url:GET|/api/v1/courses`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      fetch(`https://rmha5bol53.execute-api.us-east-2.amazonaws.com/default/canvas-api-handler?code=${code}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Fetch operation 1 failed with status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data && data.access_token) {
            setAccessToken(data.access_token);
          } else {
            console.error('Fetch operation 1: The response object or the access_token is undefined.');
          }
        })
        .catch((error) => console.error('Fetch operation 1: There was an error:', error));

      urlParams.delete("code");
      window.history.replaceState({}, "", `${window.location.pathname}?${urlParams}`);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetch(`https://rmha5bol53.execute-api.us-east-2.amazonaws.com/default/canvas-api-handler?token=${accessToken}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Fetch operation 2 failed with status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => setData(data))
        .catch((error) => console.error('Fetch operation 2: There was an error:', error));
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
