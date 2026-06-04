import React, { useEffect, useState } from "react";

function ThemeLoader({ show }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    let timer;
    if (show) {
      setVisible(true);
    } else {
      timer = setTimeout(() => setVisible(false), 500);
    }
    return () => clearTimeout(timer);
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 mt-0 flex items-center justify-center bg-white/20  z-50 transition-opacity duration-1000">
      <div className="flex flex-col items-center gap-4">
        {/* <div className="w-12 h-12 bg-blue-600 rounded-full animate-pulse"></div>
        <span className="text-gray-700 text-sm font-medium">Loading, please wait...</span> */}
        <div
          class="w-16 h-16 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"
        ></div>

      </div>
    </div>
  );
}

export default ThemeLoader;
