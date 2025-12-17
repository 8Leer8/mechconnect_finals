import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import AuthGuard from '../components/AuthGuard';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import SwitchAccount from '../pages/auth/SwitchAccount';
import MechanicSignup from '../pages/auth/MechanicSignup';
import ShopOwnerSignup from '../pages/auth/ShopOwnerSignup';


// Head Admin Pages
import HeadAdminDashboard from '../pages/headadmin/dashboard';
import HeadAdminUsers from '../pages/headadmin/Users';
import HeadAdminVerifications from '../pages/headadmin/Verifications';
import HeadAdminShops from '../pages/headadmin/Shops';
import HeadAdminTokens from '../pages/headadmin/Tokens';
import HeadAdminDisputes from '../pages/headadmin/Disputes';
import HeadAdminReports from '../pages/headadmin/Reports';
import HeadAdminFinancial from '../pages/headadmin/Financial';
import AccountManagement from '../pages/headadmin/AccountManagement';
import TokenPricing from '../pages/headadmin/TokenPricing';

// Client Pages
import Home from '../pages/client/main/Home';
import Request from '../pages/client/main/Request';
import Booking from '../pages/client/main/Booking';
import Discover from '../pages/client/main/DIscover';
import Profile from '../pages/client/main/Profile';
import IndependentMechanicProfile from '../pages/client/mechanic/IndependentMechanicProfile';
import ShopProfile from '../pages/client/shop/ShopProfile';
import IndependentMechanicServiceDetail from '../pages/client/service/IndependentMechanicServiceDetail';
import ShopServiceDetail from '../pages/client/service/ShopServiceDetail';

// Client Request Pages
import CustomRequest from '../pages/client/request/CustomRequest';
import PendingRequest from '../pages/client/side/PendingRequest';
import QuotedRequest from '../pages/client/side/QuotedRequest';
import AcceptedRequest from '../pages/client/side/AcceptedRequest';
import RejectedRequest from '../pages/client/side/RejectedRequest';

// Client Booking Detail Pages
import ActiveBooking from '../pages/client/side/ActiveBooking';
import CompletedBooking from '../pages/client/side/CompletedBooking';
import CanceledBooking from '../pages/client/side/CanceledBooking';
import BackJobsBooking from '../pages/client/side/BackJobsBooking';
import DisputedBooking from '../pages/client/side/DisputedBooking';
import RescheduledBooking from '../pages/client/side/RescheduledBooking';
import RejectedBooking from '../pages/client/side/RejectedBooking';
import RefundedBooking from '../pages/client/side/RefundedBooking';

// Shop Owner Pages
import Dashboard from '../pages/shopowner/main/dashboard';
import Mechanic from '../pages/shopowner/main/mechanic';
import ManageBooking from '../pages/shopowner/main/booking';
import Shop from '../pages/shopowner/main/shop';
import Revenue from '../pages/shopowner/main/revenue';
import ShopOwnerProfile from '../pages/shopowner/main/profile';

// Mechanic Pages
import MechanicHome from '../pages/mechanic/home';
import MechanicMap from '../pages/mechanic/map';
import MechanicJobs from '../pages/mechanic/jobs';
import MechanicJobDetail from '../pages/mechanic/job-detail';
import RequestDetail from '../pages/mechanic/request-detail';
import CompletedJobDetail from '../pages/mechanic/completed-job-detail';
import BackjobDetail from '../pages/mechanic/backjob-detail';
import MechanicEarnings from '../pages/mechanic/earnings';
import MechanicProfile from '../pages/mechanic/profile';
import MechanicNotifications from '../pages/mechanic/notifications';
import MechanicReviews from '../pages/mechanic/reviews';
import StartingJob from '../pages/mechanic/starting-job';
import WorkingJob from '../pages/mechanic/working-job';
import WalletTopUp from '../pages/mechanic/wallet/TopUp';

const AppRoutes: React.FC = () => {
  return (
    <IonRouterOutlet animated={false}>
      {/* Auth Routes */}
      <Route exact path="/login" component={Login} />
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/forgot-password" component={ForgotPassword} />
      <Route exact path="/auth/switch-account" component={SwitchAccount} />
      <Route exact path="/mechanicsignup" component={MechanicSignup} />
      <Route exact path="/shopownersignup" component={ShopOwnerSignup} />
      
      
      {/* Protected Client Routes */}
      <AuthGuard exact path="/client/home">
        <Home />
      </AuthGuard>
      <AuthGuard exact path="/client/request">
        <Request />
      </AuthGuard>
      <AuthGuard exact path="/client/booking">
        <Booking />
      </AuthGuard>
      <AuthGuard exact path="/client/discover">
        <Discover />
      </AuthGuard>
      <AuthGuard exact path="/client/profile">
        <Profile />
      </AuthGuard>
      <AuthGuard exact path="/client/mechanic-detail/:id">
        <IndependentMechanicProfile />
      </AuthGuard>
      <AuthGuard exact path="/client/shop-detail/:id">
        <ShopProfile />
      </AuthGuard>
      <AuthGuard exact path="/client/service/independentMechanicService/:id">
        <IndependentMechanicServiceDetail />
      </AuthGuard>
      <AuthGuard exact path="/client/service/shopServiceDetail/:id">
        <ShopServiceDetail />
      </AuthGuard>
      
      {/* Client Request Routes */}
      <AuthGuard exact path="/client/custom-request">
        <CustomRequest />
      </AuthGuard>
      <AuthGuard exact path="/client/pending-request/:id?">
        <PendingRequest />
      </AuthGuard>
      <AuthGuard exact path="/client/quoted-request/:id?">
        <QuotedRequest />
      </AuthGuard>
      <AuthGuard exact path="/client/accepted-request/:id?">
        <AcceptedRequest />
      </AuthGuard>
      <AuthGuard exact path="/client/rejected-request/:id?">
        <RejectedRequest />
      </AuthGuard>
      
      {/* Client Booking Detail Routes */}
      <Route exact path="/client/active-booking/:id">
        <ActiveBooking />
      </Route>
      <AuthGuard exact path="/client/completed-booking/:id">
        <CompletedBooking />
      </AuthGuard>
      <AuthGuard exact path="/client/canceled-booking/:id">
        <CanceledBooking />
      </AuthGuard>
      <AuthGuard exact path="/client/backjobs-booking/:id">
        <BackJobsBooking />
      </AuthGuard>
      <AuthGuard exact path="/client/disputed-booking/:id">
        <DisputedBooking />
      </AuthGuard>
      <AuthGuard exact path="/client/rescheduled-booking/:id">
        <RescheduledBooking />
      </AuthGuard>
      <AuthGuard exact path="/client/rejected-booking/:id">
        <RejectedBooking />
      </AuthGuard>
      <AuthGuard exact path="/client/refunded-booking/:id">
        <RefundedBooking />
      </AuthGuard>
      
      {/* Protected Shop Owner Routes */}
      <AuthGuard exact path="/shopowner/dashboard">
        <Dashboard />
      </AuthGuard>
      <AuthGuard exact path="/shopowner/mechanics">
        <Mechanic />
      </AuthGuard>
      <AuthGuard exact path="/shopowner/manage-bookings">
        <ManageBooking />
      </AuthGuard>
      <AuthGuard exact path="/shopowner/shop">
        <Shop />
      </AuthGuard>
      <AuthGuard exact path="/shopowner/profile">
        <ShopOwnerProfile />
      </AuthGuard>
      
      {/* Protected Mechanic Routes */}
      <AuthGuard exact path="/mechanic/home">
        <MechanicHome />
      </AuthGuard>
      <AuthGuard exact path="/mechanic/jobs">
        <MechanicJobs />
      </AuthGuard>
      <AuthGuard exact path="/mechanic/map">
        <MechanicMap />
      </AuthGuard>
      <AuthGuard exact path="/mechanic/job-detail/:id">
        <MechanicJobDetail />
      </AuthGuard>
      <AuthGuard exact path="/mechanic/earnings">
        <MechanicEarnings />
      </AuthGuard>
      <AuthGuard exact path="/mechanic/profile">
        <MechanicProfile />
      </AuthGuard>
      <AuthGuard exact path="/mechanic/notifications">
        <MechanicNotifications />
      </AuthGuard>
      <AuthGuard exact path="/mechanic/reviews">
        <MechanicReviews />
      </AuthGuard>
      
      {/* Default Route */}
      
      {/* Head Admin Routes */}
      <Route exact path="/headadmin/dashboard" component={HeadAdminDashboard} />
      <Route exact path="/headadmin/users" component={HeadAdminUsers} />
      <Route exact path="/headadmin/verifications" component={HeadAdminVerifications} />
      <Route exact path="/headadmin/shops" component={HeadAdminShops} />
      <Route exact path="/headadmin/tokens" component={HeadAdminTokens} />
      <Route exact path="/headadmin/disputes" component={HeadAdminDisputes} />
      <Route exact path="/headadmin/reports" component={HeadAdminReports} />
      <Route exact path="/headadmin/financial" component={HeadAdminFinancial} />
      <Route exact path="/headadmin/account-management" component={AccountManagement} />
      <Route exact path="/headadmin/token-pricing" component={TokenPricing} />
      
      {/* Client Routes */}
      <Route exact path="/client/home" component={Home} />
      <Route exact path="/client/request" component={Request} />
      <Route exact path="/client/booking" component={Booking} />
      <Route exact path="/client/discover" component={Discover} />
      <Route exact path="/client/profile" component={Profile} />
      <Route exact path="/client/mechanic-detail/:id" component={IndependentMechanicProfile} />
      <Route exact path="/client/shop-detail/:id" component={ShopProfile} />
      <Route exact path="/client/service/independentMechanicService/:id" component={IndependentMechanicServiceDetail} />
      <Route exact path="/client/service/shopServiceDetail/:id" component={ShopServiceDetail} />
      
      {/* Shop Owner Routes */}
      <Route exact path="/shopowner/dashboard" component={Dashboard} />
      <Route exact path="/shopowner/mechanics" component={Mechanic} />
      <Route exact path="/shopowner/manage-bookings" component={ManageBooking} />
      <Route exact path="/shopowner/shop" component={Shop} />
      <Route exact path="/shopowner/revenue" component={Revenue} />
      <Route exact path="/shopowner/profile" component={ShopOwnerProfile} />
      
      {/* Mechanic Routes */}
      <Route exact path="/mechanic/home" component={MechanicHome} />
      <Route exact path="/mechanic/jobs" component={MechanicJobs} />
      <Route exact path="/mechanic/map" component={MechanicMap} />
      <Route exact path="/mechanic/job-detail/:id" component={MechanicJobDetail} />
      <Route exact path="/mechanic/request-detail/:id" component={RequestDetail} />
      <Route exact path="/mechanic/available-job/:id" component={RequestDetail} />
      <Route exact path="/mechanic/start-job/:id" component={StartingJob} />
      <Route exact path="/mechanic/working-job/:id" component={WorkingJob} />
      <Route exact path="/mechanic/active-job/:id" component={MechanicJobDetail} />
      <Route exact path="/mechanic/completed-job/:id" component={CompletedJobDetail} />
      <Route exact path="/mechanic/backjob-detail/:id" component={BackjobDetail} />
      <Route exact path="/mechanic/cancelled-job/:id" component={MechanicJobDetail} />
      <Route exact path="/mechanic/earnings" component={MechanicEarnings} />
      <Route exact path="/mechanic/profile" component={MechanicProfile} />
      <Route exact path="/mechanic/wallet/topup" component={WalletTopUp} />
      
      {/* Default Route */}
      <Route exact path="/">
        <Redirect to="/shopowner/dashboard" />
      </Route>
    </IonRouterOutlet>
  );
};

export default AppRoutes;