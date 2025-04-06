import userApi from '@api/user';

import React, { createContext, useCallback, useLayoutEffect, useState } from 'react';
import { IUserContextState, IUserState } from 'chat-list/types/user';
import { getLicenseConfig, setLicenseConfig, getToken, setToken } from 'chat-list/local/local';
import { login } from 'chat-list/service/auth';
const UserContext = createContext<IUserContextState>(null);

const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<IUserState>(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openLogin, setOpenLogin] = useState(false);

  const checkUserState = async () => {
    // check token first
    // if token not exist, check if license key exist
    // if have license key ,request new token
    // if not have license key ,show license form
    // if toke exist, use api request to check token is expire
    // if return 401, check license key, use key to create new token 
    // if no license key, show form to let user input license key
    // if licnese is expire, show dialog
    try {
      setLoading(true);
      // const token = await getToken();

      // if (!token) {
      //   const licenseKey = getLicenseConfig();
      //   if (licenseKey) {
      //     const token = await login(licenseKey);
      //     setToken(token);
      //   } else {
      //     setUser({
      //       ...user,
      //       isAuthenticated: false
      //     });
      //     return;
      //   }
      // }

      const userState = await userApi.checkUser();
      const { state, email, version, exp, interval, type, points } = userState;
      // console.log(userState)
      setUser({
        ...user,
        type,
        email,
        state,
        version,
        exp,
        interval,
        username: email.split('@')[0],
        isAuthenticated: true
      });
      if (userState.key) {
        setToken(userState.key);
      }
      setPoints(points);

    } catch (e) {
      if (e.code == 401) {
        setUser({
          ...user,
          isAuthenticated: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const setUserState = useCallback(async (state = {}) => {
    setUser({
      ...user,
      ...state
    });
  }, [user]);

  const checkLicense = async (licenseKey: string) => {
    try {
      setLoading(true);
      const token = await userApi.login(licenseKey);
      // console.log(token)
      setToken(token);
      await setLicenseConfig(licenseKey || '');
      const userState = await userApi.checkUser();
      const { state, email, version, exp, interval, type, points } = userState;
      // console.log(userState)
      setUser({
        ...user,
        type,
        email,
        state,
        version,
        exp,
        interval,
        username: email.split('@')[0],
        isAuthenticated: true
      });
      setPoints(points);
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePoints = async () => {
    // try {
    //   const points = await userApi.getPoints();
    //   if (typeof points !== 'undefined') {
    //     setPoints(points);
    //   }
    // } catch (e) {
    //   console.log(e);
    // }
  };

  const signOut = async () => {
    setToken('');
    await setLicenseConfig('');
    setUser({
      ...user,
      isAuthenticated: false
    })
    setOpenLogin(true);
  }

  useLayoutEffect(() => {
    checkUserState();
    // loadApiLimit();
  }, []);


  if (!user) {
    return null;
  }

  return (
    <UserContext.Provider value={{
      loading,
      user,
      setUserState,
      points,
      updatePoints,
      checkLicense,
      signOut,
      openLogin,
      setOpenLogin,
      checkUserState
    }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
