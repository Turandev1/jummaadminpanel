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
      {user.inReview && (
        <div
          className="fixed top-0 sm:left-64 inset-0 px-8 bg-black/50 flex items-center justify-center"
          style={{ width: width - "256px" }}
        >
          <div
            style={{ fontFamily: fonts.meriendasemi }}
            className="bg-white p-4 rounded-3xl shadow-lg mb-14 max-w-4xl"
          >
            Hesabınız incələmədədir. İncələmə bitəndə satıcı hesabının
            üstünlüklərindən yararlana biləcəksiniz. Səbriniz üçün minnəttarıq.
          </div>
        </div>
      )}
    </div>
  );
};

export default Sifarisler;
