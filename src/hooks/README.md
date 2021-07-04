# Resumeable Hook

## Installation

```bash
npm i use-resumable
```

## How to use?

```javascript
function App() {
  const ref = useRef();

  const {files} = useResumable({
    browse: ref,
    updateConfigDependency: [],
    config: {}
  })

  return (
    <div className="App">
      <button ref={ref}>Upload</button>
    </div>
  );
}
```