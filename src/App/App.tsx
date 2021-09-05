import { FC } from 'react';
import Recolorizer from '../Recolorizer/Recolorizer';
import './App.css';

const App: FC = () => {
  return (
    <div className="App">
      <h1>Recolor-eyes-er</h1>
      <Recolorizer></Recolorizer>
    </div>
  );
}

export default App;
