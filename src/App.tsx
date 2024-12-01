import { Suspense } from "react";
import Home from "./components/home";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-slate-950 flex items-center justify-center text-white">
          Loading...
        </div>
      }
    >
      <Home />
      <Toaster />
    </Suspense>
  );
}

export default App;
