import React, { useState, useEffect } from 'react';
// import canvas from 

function CanvasCard() {
  const [canvas, setCanvas] = useState("");

  useEffect(() => {
    const apiKey = '13946~HgIECpPhd6zOjhdFna18iEXooHwv9Ae78QNkDPTmCWHcQiUgIXwArN0qkNVG2z4y';

    fetch('https://uiw.test.instructure.com/api/v1/users/self', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      mode: 'cors'
    })
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });
}, []);

  return (
    <div>
      <h2>Canvas Test</h2>
      <p>{canvas}</p>
    </div>
  );
}

export default CanvasCard;