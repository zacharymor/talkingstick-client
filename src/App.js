import React, { useState } from 'react';
import Broadcaster from './components/Broadcaster';
import Watcher from './components/Watcher';

function App() {
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [isWatcher, setIsWatcher] = useState(false);

  return (
    <div className="App">
      {!isBroadcaster && !isWatcher && (
        <div>
          <button onClick={() => setIsBroadcaster(true)}>Start Broadcasting</button>
          <button onClick={() => setIsWatcher(true)}>Watch Broadcast</button>
        </div>
      )}
      {isBroadcaster && <Broadcaster />}
      {isWatcher && <Watcher />}
    </div>
  );
}

export default App;
