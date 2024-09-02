import './Login.css';
import { useState } from "react";
import axios from 'axios';
import Svg1 from './svg1';
import Svg2 from './svg2';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/userSlice';

export default () => {
    const dispatch = useDispatch();
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const changeSignIn = () => {
        setPasswordVisible(false);
        setIsSignUp(false);
        setUsername('');
        setPassword('');
        setRepeatPassword('');
    };

    const changeSignUp = () => {
        setPasswordVisible(false);
        setIsSignUp(true);
        setUsername('');
        setPassword('');
        setRepeatPassword('');
    };

    const activeEnterSignIn = (e) => {
        if (!isSignUp && e.key === "Enter") {
            handleLogin();
        }
    };

    const activeEnterSignUp = (e) => {
        if (isSignUp && e.key === "Enter") {
            handleRegister();
        }
    };

    const handleRegister = () => {
        if (isSignUp && password !== repeatPassword) {
            alert("Passwords do not match");
            return;
        }
        axios.post('http://localhost:3001/register', {
            username: username,
            password: password
        }).then(response => {
            alert(response.data);
            changeSignIn();
        }).catch(error => {
            console.error('Registration error:', error);
        });
    };

    const handleLogin = () => {
        axios.post('http://localhost:3001/login', {
          username: username,
          password: password
        }).then(response => {
          if (response.data.message === 'Login successful') {
            dispatch(login(response.data.userData));
            navigate('/main');
          } else {
            alert('Invalid username or password');
            setUsername(''); 
            setPassword('');
          }
        }).catch(error => {
          console.error('Login error:', error);
          alert('Invalid username or password');
          setUsername(''); 
          setPassword('');
        });
      };
    
    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="login-title">{isSignUp ? "Create Account" : "Welcome Back!"}</h1>
                <ul className="toggle-links">
                    <li>
                        <a href="#" onClick={changeSignIn} className={!isSignUp ? 'active' : ''}>Sign In</a>
                    </li>
                    <li>
                        <a href="#" onClick={changeSignUp} className={isSignUp ? 'active' : ''}>Sign Up</a>
                    </li>
                </ul>
                <form>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type={passwordVisible ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => activeEnterSignIn(e)}
                        />
                        <span onClick={togglePasswordVisibility} className="toggle-password">
                            {passwordVisible ? <Svg1 /> : <Svg2 />}
                        </span>
                    </div>
                    {isSignUp && (
                        <div className="input-group">
                            <input
                                type={passwordVisible ? "text" : "password"}
                                placeholder="Repeat Password"
                                value={repeatPassword}
                                onChange={(e) => setRepeatPassword(e.target.value)}
                                onKeyDown={(e) => activeEnterSignUp(e)}
                            />
                            <span onClick={togglePasswordVisibility} className="toggle-password">
                                {passwordVisible ? <Svg1 /> : <Svg2 />}
                            </span>
                        </div>
                    )}
                    <button type="button" className="submit-btn" onClick={isSignUp ? handleRegister : handleLogin}>
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}