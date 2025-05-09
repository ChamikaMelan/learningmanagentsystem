import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ children, reverse = false }) => {
  const cardStyle = {
    backgroundColor: reverse ? 'rgba(0,0,0,0.4)' : 'rgb(135, 135, 135)',
    color: reverse ? '#fff' : 'rgb(255, 255, 255)',
    borderRadius: '20px',
    padding: '1rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 8px rgb(81, 81, 81)',
    position: 'relative',
  };

  return <div style={cardStyle}>{children}</div>;
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  reverse: PropTypes.bool,
};

export default Card;
