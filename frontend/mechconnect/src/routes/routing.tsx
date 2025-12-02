import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import AuthGuard from '../components/AuthGuard';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import SwitchAccount from '../pages/auth/SwitchAccount';

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

// Shop Owner Pages
import Dashboard from '../pages/shopowner/main/dashboard';
import Mechanic from '../pages/shopowner/main/mechanic';
import ManageBooking from '../pages/shopowner/main/booking';
import Shop from '../pages/shopowner/main/shop';

const AppRoutes: React.FC = () => {
  return (
    <IonRouterOutlet animated={false}>
      {/* Auth Routes */}
      <Route exact path="/login" component={Login} />
      <Route exact path="/signup" component={Signup} />
      <Route exact path="/forgot-password" component={ForgotPassword} />
      <Route exact path="/auth/switch-account" component={SwitchAccount} />
      
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
      
      {/* Default Route */}
      <Route exact path="/">
        <Redirect to="/login" />
      </Route>
    </IonRouterOutlet>
  );
};

export default AppRoutes;