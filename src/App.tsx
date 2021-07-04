import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { useResumable } from './hooks/use-resumable';

function App() {
  const ref = useRef<HTMLElement>()!;

  const {files} = useResumable({
    browse: ref,
    updateConfigDependency: [],
    config: {}
  })

  console.log(files);
  

  return (
    <div className="App">
      <button ref={ref as React.RefObject<HTMLButtonElement>}>Upload</button>
    </div>
  );
}

export default App;
