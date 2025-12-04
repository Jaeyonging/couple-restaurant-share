import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./boundary/ErrorFallback";
import Map from "./routes/map/Map";
import NavBar from "./component/NavBar/NavBar";
import Review from "./routes/review/Review";
import Home from "./routes/home/Home";
import Auth from "./component/Login/Auth";

function App() {
  return (
    <>
      <div className="flex flex-col h-[calc(100vh-50px)]">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div>로딩중...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login/auth" element={<Auth />} />
              <Route path="/map" element={<Map />} />
              <Route path="/review" element={<Review />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
      <NavBar />
    </>
  );
}

export default App;
