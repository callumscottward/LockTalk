import './App.css'
import { useEffect, useState } from 'react';

function App() {
  // Below is what a sample API call might look like to Django once backend and frontend are more linked
  // const [data, setData] = useState('');

  // useEffect(() => {
  //   fetch("http://localhost:8000/user_messages/get_messages/")
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message));
  // }, []);

  return (
    <>
      <h1>
        Welcome to LockTalk!
      </h1>
      {/* <div>
        {data}
      </div> */}
    </>
  )
}

export default App
