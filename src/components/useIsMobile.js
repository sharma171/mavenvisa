import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

function useIsMobile() {
  const MOBILE_BREAKPOINT = 768;
  const [isMobile, setIsMobile] = useState(false);
  // const userData = useSelector((state) => state?.data?.userData);
  // let user = userData?.user || {};

  useEffect(() => {
    const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
    const mql = window.matchMedia(query);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  return isMobile;
}

export default useIsMobile;
