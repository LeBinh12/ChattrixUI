import { Route, Routes } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import LoginScreen from "./pages/LoginScreen";
import MainLayout from "./layouts/MainLayout";
import HomeScreen from "./pages/HomeScreen";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PrivateRoute, PublicRoute } from "./routes/Guard";
import RegisterScreen from "./pages/RegisterScreen";
import SuggestionScreen from "./pages/SuggestionScreen";
import { useLoadUser } from "./hooks/useLoadUser";
import SuggestionLayout from "./layouts/SuggestionLayout";
import { useRecoilValue } from "recoil";
import { userAtom } from "./recoil/atoms/userAtom";
import { useEffect } from "react";
import { socketManager } from "./api/socket";

function App() {
  useLoadUser();
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    if (user?.data.id) {
      socketManager.connect(user.data.id);
      sessionStorage.setItem("socket_user", user.data.id);
    }
  }, [user?.data.id]);
  return (
    <>
      <Routes>
        <Route
          element={
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          }
        >
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
        </Route>

        <Route
          element={
            <PrivateRoute>
              <SuggestionLayout />
            </PrivateRoute>
          }
        >
          <Route path="/suggestion" element={<SuggestionScreen />} />
        </Route>

        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<HomeScreen />} />
          <Route path="/home" element={<HomeScreen />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        toastClassName="bg-white shadow-lg rounded-lg p-4 sm:p-5 text-sm sm:text-base"
      />
    </>
  );
}

export default App;
