// import { Timer } from "../features/timer/Timer";
import { Outlet } from "react-router-dom";

export const TimerPage = () => {
  
  return (
    <div>
      <Outlet />
    </div>
    // <Routes>
    //   <Route path="/" element={<Timer />} />
    // </Routes>
  );
  // return <Timer />;
};