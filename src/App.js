import React, { useState } from 'react';
import Preferences from "./Preferences";
import Centers from "./Centers";
import './App.css';

window.stateList = [];
window.districtList = [];

function App() {
  const [userDate, setUserDate] = useState({});
  return (
    <div className="App">
      <Preferences setUserSetting={setUserDate} />
      <div>
        <Centers {...userDate}/>
      </div>
    </div>
  );
}

export default App;
