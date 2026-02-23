import React from 'react';
import './TutorialButton.css';

export default function TutorialButton({ url = "https://www.youtube.com/watch?v=urG1edsKSKw", text = "Ver tutorial", variant = "default" }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`tutorial-btn tutorial-btn--${variant}`}
      title={text}
    >
      <span className="tutorial-btn__icon">▶</span>
      <span className="tutorial-btn__text">{text}</span>
    </a>
  );
}

