import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Client Pages
import Home from '../pages/client/main/Home';
import Request from '../pages/client/main/Request';
import Booking from '../pages/client/main/Booking';
import Profile from '../pages/client/main/Profile';

// Shop Owner Pages
import Dashboard from '../pages/shopowner/main/dashboard';

const AppRoutes: React.FC = () => {
  return (
    <IonRouterOutlet>
      <Route exact path="/login" component={Login} />
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/forgot-password" component={ForgotPassword} />
      <Route exact path="/client/home" component={Home} />
      <Route exact path="/client/request" component={Request} />
      <Route exact path="/client/booking" component={Booking} />
      <Route exact path="/client/profile" component={Profile} />
      <Route exact path="/shopowner/dashboard" component={Dashboard} />
      <Route exact path="/">
        <Redirect to="/shopowner/dashboard" />
      </Route>
    </IonRouterOutlet>
  );
};

export default AppRoutes;