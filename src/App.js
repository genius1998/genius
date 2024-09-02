import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import Login from './components/Login/Login';
import Main from './components/Main/Main';

// Menu 컴포넌트 삭제에 따른 경로 수정
import Head from './fix/Head';

import { logout } from './redux/userSlice';

function App() {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Router>
      <div className="App">
        <Head />
        {/* Menu 컴포넌트가 삭제되었으므로 해당 부분도 삭제 */}
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/main" />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/main"
            element={
              isLoggedIn ? (
                <Main />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? "/main" : "/"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;