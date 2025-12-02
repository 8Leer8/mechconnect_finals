import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

interface AuthGuardProps extends RouteProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, ...routeProps }) => {
  return (
    <Route
      {...routeProps}
      render={(props) => {
        const authenticated = isAuthenticated();
        
        if (!authenticated) {
          return (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: props.location }
              }}
            />
          );
        }
        
        return <>{children}</>;
      }}
    />
  );
};

export default AuthGuard;