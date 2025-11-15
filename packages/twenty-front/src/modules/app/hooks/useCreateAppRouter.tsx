import { AppRouterProviders } from '@/app/components/AppRouterProviders';
import { SettingsRoutes } from '@/app/components/SettingsRoutes';
import { VerifyLoginTokenEffect } from '@/auth/components/VerifyLoginTokenEffect';

import { VerifyEmailEffect } from '@/auth/components/VerifyEmailEffect';
import indexAppPath from '@/navigation/utils/indexAppPath';
import { BlankLayout } from '@/ui/layout/page/components/BlankLayout';
import { DefaultLayout } from '@/ui/layout/page/components/DefaultLayout';
import { AppPath } from 'twenty-shared/types';

import {
  Navigate,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';
import { Authorize } from '~/pages/auth/Authorize';
import { PasswordReset } from '~/pages/auth/PasswordReset';
import { SignInUp } from '~/pages/auth/SignInUp';
import { NotFound } from '~/pages/not-found/NotFound';
import { RecordIndexPage } from '~/pages/object-record/RecordIndexPage';
import { RecordShowPage } from '~/pages/object-record/RecordShowPage';
import { BookCall } from '~/pages/onboarding/BookCall';
import { BookCallDecision } from '~/pages/onboarding/BookCallDecision';
import { ChooseYourPlan } from '~/pages/onboarding/ChooseYourPlan';
import { CreateProfile } from '~/pages/onboarding/CreateProfile';
import { CreateWorkspace } from '~/pages/onboarding/CreateWorkspace';
import { InviteTeam } from '~/pages/onboarding/InviteTeam';
import { PaymentSuccess } from '~/pages/onboarding/PaymentSuccess';
import { SyncEmails } from '~/pages/onboarding/SyncEmails';
import { CrmRouteRedirect } from '@/navigation/components/CrmRouteRedirect';
import { PortfolioDashboardPage } from '@/property-management/pages/PortfolioDashboardPage';
import { PropertyDashboardPage } from '@/property-management/pages/PropertyDashboardPage';
import { PMAccountingPage } from '@/property-management/pages/PMAccountingPage';
import { PMInventoryPage } from '@/property-management/pages/PMInventoryPage';
import { PMInspectionsPage } from '@/property-management/pages/PMInspectionsPage';

export const useCreateAppRouter = (
  isFunctionSettingsEnabled?: boolean,
  isAdminPageEnabled?: boolean,
) =>
  createBrowserRouter(
    createRoutesFromElements(
      <Route
        element={<AppRouterProviders />}
        // To switch state to `loading` temporarily to enable us
        // to set scroll position before the page is rendered
        loader={async () => Promise.resolve(null)}
      >
        <Route path="/crm/*" element={<CrmRouteRedirect />} />
        <Route element={<DefaultLayout />}>
          <Route path={AppPath.Verify} element={<VerifyLoginTokenEffect />} />
          <Route path={AppPath.VerifyEmail} element={<VerifyEmailEffect />} />
          <Route path={AppPath.SignInUp} element={<SignInUp />} />
          <Route path={AppPath.Invite} element={<SignInUp />} />
          <Route path={AppPath.ResetPassword} element={<PasswordReset />} />
          <Route path={AppPath.CreateWorkspace} element={<CreateWorkspace />} />
          <Route path={AppPath.CreateProfile} element={<CreateProfile />} />
          <Route path={AppPath.SyncEmails} element={<SyncEmails />} />
          <Route path={AppPath.InviteTeam} element={<InviteTeam />} />
          <Route path={AppPath.PlanRequired} element={<ChooseYourPlan />} />
          <Route
            path={AppPath.PlanRequiredSuccess}
            element={<PaymentSuccess />}
          />
          <Route
            path={AppPath.BookCallDecision}
            element={<BookCallDecision />}
          />
          <Route path={AppPath.BookCall} element={<BookCall />} />
          <Route path={indexAppPath.getIndexAppPath()} element={<></>} />
          <Route path={AppPath.RecordIndexPage} element={<RecordIndexPage />} />
          <Route path={AppPath.RecordShowPage} element={<RecordShowPage />} />
          <Route
            path={AppPath.SettingsCatchAll}
            element={
              <SettingsRoutes
                isFunctionSettingsEnabled={isFunctionSettingsEnabled}
                isAdminPageEnabled={isAdminPageEnabled}
              />
            }
          />
          <Route path={AppPath.NotFoundWildcard} element={<NotFound />} />
        </Route>
        <Route path="/pm" element={<DefaultLayout />}>
          <Route path="dashboard" element={<PortfolioDashboardPage />} />
          <Route
            path="property/:propertyId"
            element={<PropertyDashboardPage />}
          />
          <Route path="accounting" element={<PMAccountingPage />} />
          <Route path="inventory" element={<PMInventoryPage />} />
          <Route path="inspections" element={<PMInspectionsPage />} />
          <Route
            path="properties"
            element={<Navigate to="/pm/objects/properties" replace />}
          />
          <Route
            path="units"
            element={<Navigate to="/pm/objects/units" replace />}
          />
          <Route
            path="leases"
            element={<Navigate to="/pm/objects/leases" replace />}
          />
          <Route
            path="work-orders"
            element={<Navigate to="/pm/objects/workOrders" replace />}
          />
          <Route
            path="objects/:objectNamePlural"
            element={<RecordIndexPage />}
          />
          <Route
            path="object/:objectNameSingular/:objectRecordId"
            element={<RecordShowPage />}
          />
        </Route>
        <Route element={<BlankLayout />}>
          <Route path={AppPath.Authorize} element={<Authorize />} />
        </Route>
      </Route>,
    ),
  );
