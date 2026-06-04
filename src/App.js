import { Link } from "react-router-dom";
import AllRoutes from "routes";
import "./App.css";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "components";
import { useSelector } from "react-redux";
import useIsMobile from "components/useIsMobile";

function App() {
  const userData = useSelector((state) => state?.data?.userData);
  let isLoggedIn = userData?.token;
  const isMobile = useIsMobile();

  const renderView = () => {
    let mobileStyle = {};
    if (isMobile) {
      mobileStyle = { paddingTop: "70px" };
    }
    if (isLoggedIn) {
      return (
        <div className="flex h-screen" style={mobileStyle}>
          <Sidebar />
          <div className="flex-1 overflow-auto relative">
            <div className="p-4 md:p-6">
              <AllRoutes />
            </div>
          </div>
        </div>
      );
    }
    return <AllRoutes />;
  };

  return (
    <div>
      {renderView()}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
