import React, { useState } from 'react';
import Broadcaster from './components/Broadcaster';
import Watcher from './components/Watcher';

function App() {
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [isWatcher, setIsWatcher] = useState(false);

  return (
    <div className="App">
      {"" + isBroadcaster}
      {!isBroadcaster && !isWatcher && (
        <div>
          <button onClick={() => setIsWatcher(true)}>Join</button>
        </div>
      )}
      {isBroadcaster && <Broadcaster setIsBroadcaster={setIsBroadcaster} setIsWatcher={setIsWatcher}/>}
      {isWatcher && <Watcher setIsBroadcaster={setIsBroadcaster} setIsWatcher={setIsWatcher}/>}
    </div>
  );
}

export default App;
