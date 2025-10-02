import React, { useState, useEffect } from 'react';
import './TitleBar.css';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Listen for window state changes (you'll need to implement this in main process)
    const handleStateChange = (event, state) => {
      setIsMaximized(state === 'maximized');
    };

    window.electronAPI?.onWindowStateChange(handleStateChange);
    
    return () => {
      // Cleanup listener
    };
  }, []);

  const handleMinimize = () => {
    window.electronAPI?.windowControl('minimize');
  };

  const handleMaximize = () => {
    window.electronAPI?.windowControl('maximize');
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    window.electronAPI?.windowControl('close');
  };

  return (
    <div className="title-bar">
      <div className="title-bar-drag-region">
        <div className="window-title">My Electron App</div>
      </div>
      
      <div className="window-controls">
        <button 
          className="control-button minimize-button"
          onClick={handleMinimize}
          aria-label="Minimize"
        >
          <span>−</span>
        </button>
        
        <button 
          className="control-button maximize-button"
          onClick={handleMaximize}
          aria-label={isMaximized ? "Restore" : "Maximize"}
        >
          <span>{isMaximized ? '⧉' : '□'}</span>
        </button>
        
        <button 
          className="control-button close-button"
          onClick={handleClose}
          aria-label="Close"
        >
          <span>×</span>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;