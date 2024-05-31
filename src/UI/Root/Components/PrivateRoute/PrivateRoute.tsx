import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { DependencyContext } from "@/UI/Dependency";
import { Initializer } from "../Initializer";

const PrivateRoute = () => {
  const { useAuth } = useContext(DependencyContext);
  if (!useAuth.getToken()) return <Navigate to="/login" />;
  return (
    <Initializer>
      <Outlet />
    </Initializer>
  );
};

export default PrivateRoute;
