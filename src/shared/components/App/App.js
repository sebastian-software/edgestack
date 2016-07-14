import 'normalize.css/normalize.css';
import './globals.css';

import React, { PropTypes } from 'react';
import Link from 'react-router/lib/Link';

function App({ children }) {
  return (
    <div style={{ padding: '10px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Advanced Boilerplate</h1>
        <strong>A NodeJS V6 Universal React Boilerplate with an Amazing Developer Experience.</strong>
      </div>
      <div>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>

      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
App.propTypes = {
  children: PropTypes.node,
};

export default App;
