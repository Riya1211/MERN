import { ReactElement } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface Props {
  children?: ReactElement;
  isAuthenticated: boolean;
  adminOnly?: boolean; //telling if which page only admin can use
  isAdmin?: boolean; //is user is admin or not
  redirect?: string;
}

const ProtectedRoute = ({
  isAuthenticated,
  children,
  adminOnly,
  isAdmin,
  redirect = "/",
}: Props) => {
  if (!isAuthenticated) return <Navigate to={redirect} />;

  if(adminOnly && !isAdmin) return <Navigate to={redirect} />;
  return children ? children : <Outlet />;
  //If any children is there it will show or anything below this protecteRoute will show using of outlet this will help to reduce the number of line   
};

export default ProtectedRoute;