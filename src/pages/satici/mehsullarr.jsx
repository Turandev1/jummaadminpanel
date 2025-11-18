import React, { useEffect } from "react";
import api from "../../utils/axiosclient";
import { API_URLS, SATICIENDPOINT } from "../../utils/api";

const Mehsullarr = () => {
  useEffect(() => {
    const fetchproducts = async () => {
      const res = await api.get(API_URLS.SATICI.GETPRODUCTS);
    };
    fetchproducts();
  }, []);

  return <div>Mehsullarr</div>;
};

export default Mehsullarr;
