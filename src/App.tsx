import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "./routes/home/Home";
import "./App.css";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./boundary/ErrorFallback";
import Map from "./routes/map/Map";

function App() {
  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<div>로딩중...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<Map />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App;
