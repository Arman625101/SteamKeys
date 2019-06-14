import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import fetchApi from '../../utils/fetchApi';
import { useStateValue } from '../../context';
import './Header.scss';

const Header = ({ info }) => {
  const [{ user, authenticated }] = useStateValue();
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || 3000;
  const url =
    process.env.NODE_ENV === 'development'
      ? `http://${host}:${port}`
      : `http://${host}`;
  const logout = () => e => {
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('token');
    fetchApi('/auth/logout', { method: 'GET', credentials: 'include' }).then(
      res => {
        if (!res.isLogged) {
          window.open(`${window.location.origin}/`, '_self');
        }
      },
    );
  };
  const authSteam = () => e => {
    window.open(`${url}/auth/steam`, '_self');
  };

  return (
    <header>
      <div className="header_holder">
        <ul className="nav">
          <li>
            <Link to="/roulette" href="/roulette">
              Homepage
            </Link>
          </li>
          <li>
            <Link to="/roulette" href="/roulette">
              FAQ
            </Link>
          </li>
          <li>
            <Link to="/roulette" href="/roulette">
              Keys for Free
            </Link>
          </li>
        </ul>
        <div className="actions">
          {authenticated ? (
            <React.Fragment>
              <div className="avatar">
                <Link to="/profile" href="/profile">
                  <img src={user.imgurl} alt="" />
                </Link>
              </div>
              <div className="settings">
                <Link to="/profile" href="/profile">
                  <FiSettings />
                  <p>Settings</p>
                </Link>
              </div>
            </React.Fragment>
          ) : (
            // <button onClick={logout()}>Logout</button>
            // <a href={user.profileurl} rel="noopener noreferrer" target="_blank">
            //   {user.username}
            // </a>
            <li>
              <button onClick={authSteam()}>Login</button>
            </li>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
