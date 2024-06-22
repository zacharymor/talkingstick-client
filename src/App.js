import React, { useState } from 'react';
import Broadcaster from './components/Broadcaster';
import Watcher from './components/Watcher';
import Watcher0 from './components/Watcher';

function App() {
  const [isBroadcaster, setIsBroadcaster] = useState(false);
  const [isWatcher, setIsWatcher] = useState(false);
  const [isWatcher0, setIsWatcher0] = useState(false);

  return (
    <div className="App">
      {"" + isBroadcaster}
      {!isBroadcaster && !isWatcher && !isWatcher0 && (
        <div>
          <button onClick={() => setIsBroadcaster(true)}>Start Broadcasting</button>
          <button onClick={() => setIsWatcher(true)}>Watch Broadcast</button>
          {/* <button onClick={() => setIsWatcher0(true)}>Watch Broadcast0</button> */}
        </div>
      )}
      {isBroadcaster && <Broadcaster setIsBroadcaster={setIsBroadcaster} setIsWatcher={setIsWatcher}/>}
      {isWatcher && <Watcher setIsBroadcaster={setIsBroadcaster} setIsWatcher={setIsWatcher}/>}
      {/* {isWatcher0 && <Watcher0 setIsBroadcaster={setIsBroadcaster} setIsWatcher={setIsWatcher}/>} */}
    </div>
  );
}

export default App;
