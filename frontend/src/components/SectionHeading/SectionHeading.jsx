import React from 'react';
import './SectionHeading.css';

const SectionHeading = ({ title }) => {
  return (
    <div className="section-heading-container">
      <h2 className="section-title">{title}</h2>
    </div>
  );
};

export default SectionHeading;
