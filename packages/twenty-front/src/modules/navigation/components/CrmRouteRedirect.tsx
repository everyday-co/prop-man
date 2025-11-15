import { Navigate, useLocation } from 'react-router-dom';

const stripCrmPrefix = (pathname: string) => {
  if (!pathname.startsWith('/crm')) {
    return pathname || '/';
  }

  const stripped = pathname.replace(/^\/crm/, '') || '/';

  return stripped.startsWith('/') ? stripped : `/${stripped}`;
};

export const CrmRouteRedirect = () => {
  const location = useLocation();
  const pathname = stripCrmPrefix(location.pathname);
  const search = location.search ?? '';
  const hash = location.hash ?? '';

  return <Navigate to={`${pathname}${search}${hash}`} replace />;
};
