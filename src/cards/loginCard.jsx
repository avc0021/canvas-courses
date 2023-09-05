import React from 'react';

export default function Login() {
  const canvasAuthURL = `https://uiw.test.instructure.com/login/oauth2/auth?client_id=139460000000000141&response_type=code&redirect_uri=https://experience-test.elluciancloud.com/uotiwtest/&scope=url:GET|/api/v1/users/:user_id/courses`;

  return (
    <div>
      <a href={canvasAuthURL}>Login with Canvas</a>
    </div>
  );
}