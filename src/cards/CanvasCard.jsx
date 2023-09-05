import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableRow, TableHead, Typography } from '@ellucian/react-design-system/core'
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';

const columnStyles = {
  // textAlign: 'center',
  // verticalAlign: 'middle'
  height: '100%',
  marginTop: 0,
  marginRight: spacing40,
  marginBottom: 0,
  marginLeft: spacing40,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around'
};

const CanvasCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch('https://rmha5bol53.execute-api.us-east-2.amazonaws.com/default/canvas-api-handler', {
      method: 'GET'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => setCourses(data))
    .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
  <div>
  <Table striped bordered hover>
    {/* <TableHead>
      <TableRow>
        <TableCell style={columnStyles} align="left">Course Name</TableCell>
        <TableCell style={columnStyles} align="left">Grade</TableCell>
      </TableRow>
    </TableHead> */}
    <TableBody>
      {courses.map(course => (
        <TableRow key={course.id}>
          <TableCell style={columnStyles}>Course: {course.name}</TableCell>
          <TableCell style={columnStyles}>Grade: {course.enrollments[0]?.computed_current_score || 'N/A'}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
)
};

export default CanvasCourses;
