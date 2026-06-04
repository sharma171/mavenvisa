import React from "react";
import { useSelector } from "react-redux";
import { Route, Routes, Navigate } from "react-router-dom";
import { Auth, ApplicationReview, AdminAuth, UserAdmin, Documents, Homepage, LandingPage, Communications, NewVisaSelector, ContinueForm } from "pages";

function AllRoutes() {
  const userToken = useSelector((state) => state?.data?.userData?.token);
  const loggedInUser = useSelector((state) => state?.data?.userData?.user?.user_role);


  const publicRoutes = () => {
    if (userToken) {
      return <Route path="*" element={<Navigate to="/" replace />} />;
    }

    return (
      <>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/adminauth" element={<AdminAuth />} />
        <Route path="/resetPassword" element={<Auth />} />
      </>
    );
  };

  const privateRoutes = () => {
    if (!userToken) {
      return <Route path="*" element={<Navigate to="/auth" replace />} />;
    }

    return (
      <>
        {loggedInUser === "admin" ? (<>
          <Route path="/" element={<UserAdmin />} />
          <Route path="/application" element={<ApplicationReview />} />
          <Route path="/communications" element={<Communications />} />
        </>) : (<>

          <Route path="/" element={<Homepage />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/communications" element={<Communications />} />
          <Route path="/newvisaform" element={<NewVisaSelector />} />
          <Route path="/application/continue" element={<ContinueForm />} />
          <Route path="/application/new" element={<ContinueForm />} />
        </>
        )}
      </>
    );
  };

  return (
    <Routes>
      {publicRoutes()}
      {privateRoutes()}
    </Routes>
  );
}

export default AllRoutes;
