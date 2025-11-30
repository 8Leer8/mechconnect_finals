import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import SwitchAccount from '../pages/auth/SwitchAccount';
import MechanicSignup from '../pages/auth/MechanicSignup';
import ShopOwnerSignup from '../pages/auth/ShopOwnerSignup';

// Client Pages
import Home from '../pages/client/main/Home';
import Request from '../pages/client/main/Request';
import Booking from '../pages/client/main/Booking';
import Discover from '../pages/client/main/DIscover';
import Profile from '../pages/client/main/Profile';

// Client Side Pages
import PaymentHistory from '../pages/client/side/PaymentHistory';
import Favorite from '../pages/client/side/Favorite';
import AccountSettings from '../pages/client/side/AccountSettings';
import PendingRequest from '../pages/client/side/PendingRequest';
import RejectedRequest from '../pages/client/side/RejectedRequest';
import QuotedRequest from '../pages/client/side/QuotedRequest';
import AcceptedRequest from '../pages/client/side/AcceptedRequest';
import ActiveBooking from '../pages/client/side/ActiveBooking';
import RejectedBooking from '../pages/client/side/RejectedBooking';
import CanceledBooking from '../pages/client/side/CanceledBooking';
import CompletedBooking from '../pages/client/side/CompletedBooking';
import RescheduledBooking from '../pages/client/side/RescheduledBooking';
import BackJobsBooking from '../pages/client/side/BackJobsBooking';
import DisputedBooking from '../pages/client/side/DisputedBooking';
import RefundedBooking from '../pages/client/side/RefundedBooking';
import RescheduleBookingForm from '../pages/client/side/RescheduleBookingForm';
import CancelBookingForm from '../pages/client/side/CancelBookingForm';
import Notification from '../pages/client/side/Notification';
import CounterOfferForm from '../pages/client/side/CounterOfferForm';
import BackJobsForm from '../pages/client/side/BackJobsForm';

// Client Request Pages
import CustomRequest from '../pages/client/request/CustomRequest';
import DirectRequest from '../pages/client/request/DirectRequest';
import EmergencyRequest from '../pages/client/request/EmergencyRequest';

// Client Payment Pages
import AdvancePayment from '../pages/client/payment/AdvancePayment';
import ClientPayment from '../pages/client/payment/ClientPayment';
import PaymentDetail from '../pages/client/payment/PaymentDetail';

// Client Mechanic Pages
import IndependentMechanicProfile from '../pages/client/mechanic/IndependentMechanicProfile';
import ShopMechanicProfile from '../pages/client/mechanic/ShopMechanicProfile';

// Client Shop Pages
import ShopProfile from '../pages/client/shop/ShopProfile';

// Client Service Pages
import IndependentMechanicServiceDetail from '../pages/client/service/IndependentMechanicServiceDetail';
import ShopServiceDetail from '../pages/client/service/ShopServiceDetail';

const AppRoutes: React.FC = () => {
  return (
    <IonRouterOutlet>
      <Route exact path="/login" component={Login} />
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/forgot-password" component={ForgotPassword} />
      <Route exact path="/mechanic-signup" component={MechanicSignup} />
      <Route exact path="/shop-owner-signup" component={ShopOwnerSignup} />
      <Route exact path="/client/switch-account" component={SwitchAccount} />
      <Route exact path="/client/home" component={Home} />
      <Route exact path="/client/request" component={Request} />
      <Route exact path="/client/booking" component={Booking} />
      <Route exact path="/client/discover" component={Discover} />
      <Route exact path="/client/profile" component={Profile} />
      <Route exact path="/client/payment-history" component={PaymentHistory} />
      <Route exact path="/client/favorite" component={Favorite} />
      <Route exact path="/client/account-settings" component={AccountSettings} />
      <Route exact path="/client/pending-request" component={PendingRequest} />
      <Route exact path="/client/rejected-request" component={RejectedRequest} />
      <Route exact path="/client/quoted-request" component={QuotedRequest} />
      <Route exact path="/client/accepted-request" component={AcceptedRequest} />
      <Route exact path="/client/active-booking" component={ActiveBooking} />
      <Route exact path="/client/rejected-booking" component={RejectedBooking} />
      <Route exact path="/client/canceled-booking" component={CanceledBooking} />
      <Route exact path="/client/completed-booking" component={CompletedBooking} />
      <Route exact path="/client/rescheduled-booking" component={RescheduledBooking} />
      <Route exact path="/client/backjobs-booking" component={BackJobsBooking} />
      <Route exact path="/client/disputed-booking" component={DisputedBooking} />
      <Route exact path="/client/refunded-booking" component={RefundedBooking} />
      <Route exact path="/client/reschedule-booking-form" component={RescheduleBookingForm} />
      <Route exact path="/client/cancel-booking-form" component={CancelBookingForm} />
      <Route exact path="/client/notifications" component={Notification} />
      <Route exact path="/client/counter-offer-form" component={CounterOfferForm} />
      <Route exact path="/client/back-jobs-form" component={BackJobsForm} />
      <Route exact path="/client/custom-request" component={CustomRequest} />
      <Route exact path="/client/direct-request" component={DirectRequest} />
      <Route exact path="/client/emergency-request" component={EmergencyRequest} />
      <Route exact path="/client/advance-payment" component={AdvancePayment} />
      <Route exact path="/client/client-payment" component={ClientPayment} />
      <Route exact path="/client/payment-detail" component={PaymentDetail} />
      <Route exact path="/client/mechanic-profile/:id" component={IndependentMechanicProfile} />
      <Route exact path="/client/shop-mechanic-profile/:id" component={ShopMechanicProfile} />
      <Route exact path="/client/shop-profile/:id" component={ShopProfile} />
      <Route exact path="/client/independent-mechanic-service-detail/:id" component={IndependentMechanicServiceDetail} />
      <Route exact path="/client/shop-service-detail/:id" component={ShopServiceDetail} />
      <Route exact path="/">
        <Redirect to="/login" />
      </Route>
    </IonRouterOutlet>
  );
};

export default AppRoutes;