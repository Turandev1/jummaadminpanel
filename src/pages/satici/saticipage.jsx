import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fonts } from "../../../fonts";
import useAuth from "../../redux/authredux";

// renk paleti
const colors = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28"];

// örnekdata.js

const exampleMonthlySales = [
  { month: "Yanvar", sales: 12 },
  { month: "Fevral", sales: 19 },
  { month: "Mart", sales: 8 },
  { month: "Aprel", sales: 15 },
  { month: "May", sales: 22 },
];

const exampleProductSales = [
  { name: "Alma", value: 25 },
  { name: "Portağal", value: 18 },
  { name: "Kivi", value: 12 },
  { name: "Banan", value: 30 },
];

const Saticipage = () => {
  const [monthlysalesamount, setmonthlysalesamount] = useState([]);
  const [productSalesData, setproductSalesData] = useState([]);
  const totalSales = productSalesData.reduce((sum, p) => sum + p.value, 0);
  const totalRevenue = totalSales * 10; // örnek hesaplama (backendden alınacak)
  const [width, setWidth] = useState(window.innerWidth);
  const { user } = useAuth();
  
  
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setmonthlysalesamount(exampleMonthlySales);
    setproductSalesData(exampleProductSales);
  }, []);

  return (
    <div className="p-8 w-full bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Satıcı Paneli</h1>

      {/* Özet Kutuları */}

      <h1
        style={{ fontFamily: fonts.arimabold }}
        className="border-b-2 mb-4 pb-2 text-xl border-indigo-500"
      >
        Aylıq xülasə
      </h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <SummaryCard title="Ümumi Satış" value={`${totalSales} ədəd`} />
        <SummaryCard title="Ümumi Qazanc" value={`${totalRevenue} AZN`} />
        <SummaryCard
          title="Məhsul Sayı"
          value={`${productSalesData.length} məhsul`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Aylık Satış Grafiği */}
        {/* Aylık Satış Grafiği */}
        <div className="bg-white p-6 rounded-xl shadow-md w-full">
          <h2 className="font-semibold mb-4 text-2xl">Aylık Satış Qrafiki</h2>
          <div className="w-full h-[300px] flex items-center justify-center">
            {monthlysalesamount.length === 0 ? (
              <span className="text-gray-500 text-2xl">
                Bu haqda məlumat yoxdur
              </span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlysalesamount}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#0088FE" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Ürünlere göre satış dağılımı */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col">
          <h2 className="font-semibold mb-4 text-2xl">Məhsul Satış Payları</h2>
          {productSalesData.length === 0 ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <span className="text-gray-500 text-2xl">
                Bu haqda məlumat yoxdur
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <PieChart width={350} height={300}>
                <Pie
                  data={productSalesData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={100}
                  label
                >
                  {productSalesData.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          )}
        </div>
      </div>

      {/* Satılan Ürün Listesi */}
      <div className="bg-white p-6 rounded-xl shadow-md mt-10">
        <h2 className="font-semibold mb-4 text-2xl">Satılan Məhsullar</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-lg text-gray-600">
              <th className="py-2">Məhsul adı</th>
              <th>Miqdar</th>
            </tr>
          </thead>
          <tbody>
            {productSalesData.map((p, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{p.name}</td>
                <td>{p.value} ədəd</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

const SummaryCard = ({ title, value }) => (
  <div className="bg-white p-5 rounded-xl shadow-md">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export default Saticipage;
