import { Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./boundary/ErrorFallback";
import Map from "./routes/map/Map";
import NavBar from "./component/NavBar/NavBar";
import Review from "./routes/review/Review";
import Home from "./routes/home/Home";
import Auth from "./component/Login/Auth";
import Calendar from "./routes/calendar/Calendar";
import Toast from "./component/Toast/Toast";
import { useLoginStore } from "./store/data";

function App() {
  const { setIsLogin } = useLoginStore();
  const location = useLocation();

  useEffect(() => {
    // 앱 시작 시 토큰 확인
    const token = localStorage.getItem('token');
    if (token) {
      // 토큰 유효성 간단 체크 (실제로는 서버에서 검증해야 함)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // 토큰 만료 시간 체크
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          setIsLogin(true);
        } else {
          localStorage.removeItem('token');
          setIsLogin(false);
        }
      } catch (error) {
        localStorage.removeItem('token');
        setIsLogin(false);
      }
    } else {
      setIsLogin(false);
    }
  }, [setIsLogin]);

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-50px)]">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div>로딩중...</div>}>
            <div key={location.pathname} className="page-transition">
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/login/auth" element={<Auth />} />
                <Route path="/map" element={<Map />} />
                <Route path="/review" element={<Review />} />
                <Route path="/calendar" element={<Calendar />} />
              </Routes>
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
      <NavBar />
      <Toast />
      <style>{`
        .page-transition {
          animation: pageFadeIn 0.4s ease-out;
          width: 100%;
          height: 100%;
        }
        @keyframes pageFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default App;
