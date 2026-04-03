import React from 'react';

import { COPYRIGHT, FULL_NAME, YEAR } from '../utils/constants';

const Navbar = () => {
  return (
    <section id="navbar">
      <div className="container">
        <p>{COPYRIGHT} &copy; {YEAR} - {FULL_NAME}</p>
      </div>
    </section>
  );
};

export default Navbar;