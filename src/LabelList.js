import React, { useContext } from 'react';
import LabelContext from './LabelContext';

function LabelList({ changeColor }) {
    const { labels } = useContext(LabelContext);
  
    const handleClick = (index) => {
      const newColor = prompt('Bitte geben Sie eine neue Farbe ein:');
      if (newColor && newColor.trim() !== "") {
        changeColor(index, newColor);
      }
    };
  
    return (
      <div className="label-list">
        {Object.entries(labels).map(([index, label]) => (
          <div key={index} onClick={() => handleClick(index)} style={{ color: label.color }}>
            {label.name}
          </div>
        ))}
      </div>
    );
  }
  

export default LabelList;