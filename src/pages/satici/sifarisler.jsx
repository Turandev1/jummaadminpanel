import React from "react";
import useAuth from "../../redux/authredux";
import { useState } from "react";
import { useEffect } from "react";
import { fonts } from "../../../fonts";

const Sifarisler = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      Sifarisler
  
    </div>
  );
};

export default Sifarisler;
