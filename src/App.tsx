import { Outlet } from "react-router";
import { Suspense } from "react";

function App() {
  return (
    <div className="p-4 h-screen">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="text-lg text-gray-400">Loading...</div>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  );
}

export default App;
