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
import Discover from '../pages/client/main/DIscover';
import Profile from '../pages/client/main/Profile';
import IndependentMechanicProfile from '../pages/client/mechanic/IndependentMechanicProfile';

// Shop Owner Pages
import Dashboard from '../pages/shopowner/main/dashboard';
import Mechanic from '../pages/shopowner/main/mechanic';
import ManageBooking from '../pages/shopowner/main/booking';
import Shop from '../pages/shopowner/main/shop';

const AppRoutes: React.FC = () => {
  return (
    <IonRouterOutlet>
      <Route exact path="/login" component={Login} />
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/forgot-password" component={ForgotPassword} />
      <Route exact path="/client/home" component={Home} />
      <Route exact path="/client/request" component={Request} />
      <Route exact path="/client/booking" component={Booking} />
      <Route exact path="/client/discover" component={Discover} />
      <Route exact path="/client/profile" component={Profile} />
      <Route exact path="/client/mechanic-detail/:id" component={IndependentMechanicProfile} />
      <Route exact path="/shopowner/dashboard" component={Dashboard} />
      <Route exact path="/shopowner/mechanics" component={Mechanic} />
      <Route exact path="/shopowner/manage-bookings" component={ManageBooking} />
      <Route exact path="/shopowner/shop" component={Shop} />
      <Route exact path="/">
        <Redirect to="/shopowner/mechanics" />
      </Route>
    </IonRouterOutlet>
  );
};

export default AppRoutes;