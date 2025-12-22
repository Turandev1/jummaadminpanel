import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import mescidaglogo from "../../assets/mescidag.png";
import axios from "axios";
import { API_URLS } from "../../utils/api";
import { Navigate, useNavigate } from "react-router-dom";
import useGetClientInfo from "../../components/osinfo";
import {
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  LockKeyhole,
  User,
  Mail,
  Lock,
  ArrowLeftCircle,
  ArrowRightCircle,
  ArrowRight,
  CheckSquare,
  Square,
  SquareCheck,
  X,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { setauthdata } from "../../redux/store";
import api from "../../utils/axiosclient";

const SaticiRegister = ({ setView }) => {
  const [showpassword, setshowpassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [openterms, setopenterms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  // const enabled=formData.name||formData.surname||formData.email||formData.password

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast.error("Satıcı müqaviləsini qəbul etməlisiniz");
      return;
    }
    try {
      const res = await api.post(API_URLS.SATICI.SATICISIGNUP, {
        ad: formData.name,
        soyad: formData.surname,
        email: formData.email,
        password: formData.password,
        acceptedTerms,
      });

      const data = res.data;

      if (data.success) {
        toast.success("Qeydiyyat uğurla başa çatdı. Hesabınıza daxil olun", {
          autoClose: 3000,
        });
      }
      setView("login");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.hata || "Qeydiyyat zamanı xəta baş verdi"
      );
    }
  };

  return (
    <div className="w-full flex justify-center items-center mt-8 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-green-100">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          Satıcı Qeydiyyatı
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-600">Ad</label>
            <div className="flex items-center bg-gray-100 gap-2 border rounded-lg px-3 py-2 focus-within:border-green-500 transition">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınızı daxil edin"
                className="w-full outline-none text-gray-700"
                required
              />
            </div>
          </div>

          {/* Surname */}
          <div>
            <label className="text-sm font-medium text-gray-600">Soyad</label>
            <div className="flex items-center bg-gray-100 gap-2 border rounded-lg px-3 py-2 focus-within:border-green-500 transition">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Soyadınızı daxil edin"
                className="w-full outline-none text-gray-700"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <div className="flex items-center bg-gray-100 gap-2 border rounded-lg px-3 py-2 focus-within:border-green-500 transition">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email daxil edin"
                className="w-full outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-600">Şifrə</label>
            <div className="flex items-center bg-gray-100 gap-2 border rounded-lg px-3 py-2 focus-within:border-green-500 transition">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showpassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Şifrənizi daxil edin"
                className="w-full outline-none"
                required
              />
              <button
                className="cursor-pointer"
                type="button"
                onClick={() => setshowpassword(!showpassword)}
              >
                {showpassword ? "Gizlə" : "Göstər"}
              </button>
            </div>
            {/* Satici sozlesmesi */}
            <div className="flex mt-3 items-center gap-2 text-sm text-gray-600">
              <button
                type="button"
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                className="text-green-600 cursor-pointer hover:scale-110 transition"
              >
                {acceptedTerms ? (
                  <SquareCheck fill="green" color="white" size={20} />
                ) : (
                  <Square size={20} />
                )}
              </button>

              <p className="leading-snug">
                <span
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  className="cursor-pointer"
                >
                  <strong>Satıcı müqaviləsini</strong>
                </span>{" "}
                oxudum və qəbul edirəm.{" "}
                <button
                  type="button"
                  onClick={() => setopenterms(true)}
                  className="text-green-500 font-bold cursor-pointer hover:text-green-800 transition-all duration-300"
                >
                  (Oxu)
                </button>
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full cursor-pointer bg-green-600 text-white py-2 rounded-lg text-lg font-medium hover:bg-green-700 transition-all"
          >
            Qeydiyyat
          </button>
        </form>

        {/* Satici Sozlesmesi Modal */}
        {openterms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl p-6 relative animate-fadeIn">
              {/* Close button */}
              <button
                onClick={() => setopenterms(false)}
                className="absolute right-4 top-4 cursor-pointer text-gray-500 hover:text-red-500 transition"
              >
                <X size={24} />
              </button>

              {/* Title */}
              <h3 className="text-xl font-bold text-green-700 mb-4">
                Satıcı Müqaviləsi
              </h3>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto text-sm text-gray-700 space-y-6 pr-4 leading-relaxed bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                <div className="border-b pb-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
                    JUMMA SATICI PANELİ – QISA HÜQUQİ XÜLASƏ
                  </h2>
                  <p className="mb-4 italic text-gray-600">
                    Bu xülasə Jumma Platformasında Satıcı kimi fəaliyyət
                    göstərərkən əsas hüquq və öhdəliklərinizi{" "}
                    <strong>qısa və aydın formada</strong> təqdim edir.
                    Platformada aktiv olmaqla siz{" "}
                    <strong>Satıcı Müqaviləsini (Seller Agreement)</strong> tam
                    şəkildə qəbul etmiş sayılırsınız.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        1. Sizin statusunuz
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Müstəqil Satıcı kimi çıxış edirsiniz.</li>

                        <li>Məhsulların birbaşa satıcısı sizsiniz.</li>

                        <li>Jumma texnoloji və əməliyyat platformasıdır.</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        2. Məhsullara dair məsuliyyət
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Məhsullar halal prinsiplərinə uyğun olmalıdır.</li>

                        <li>
                          Keyfiyyət və halal statusu tam sizin
                          məsuliyyətinizdədir.
                        </li>

                        <li>Məhsul təsvirləri real və düzgün olmalıdır.</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        3. Qiymət və komissiya
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Qiymətləri siz müəyyən edirsiniz.</li>

                        <li>
                          Hər satışdan <strong>10%</strong> vasitəçilik haqqı
                          tutulur.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        4. Ödənişlər və Çatdırılma
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Ödənişlər minimum 3 gündən bir köçürülür.</li>

                        <li>Məhsul təhvil verilənədək risk satıcınındır.</li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-blue-600 mt-4 font-medium uppercase tracking-wider">
                    Qeyd: Bu xülasə məlumat məqsədlidir.Ətraflı şərtlər
                    aşağıdakı əsas müqavilədədir.
                  </p>
                </div>
                {/* seller aggreement */}
                <div className="border-b pb-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
                    JUMMA PLATFORMASI ÜZRƏ SATICI MÜQAVİLƏSİ (SELLER AGREEMENT){" "}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        1. ÜMUMİ MÜDDƏALAR
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          1.1. Bu Satıcı Müqaviləsi (bundan sonra –
                          <strong>Müqavilə</strong>) "Jumma" mobil tətbiqi və
                          ona inteqrasiya olunmuş onlayn marketplace platforması
                          (bundan sonra –<strong>Platforma</strong>) üzərindən
                          məhsulların satışı ilə bağlı hüquqi münasibətləri
                          tənzimləyir.
                        </li>

                        <li>
                          1.2. Platformanın sahibi və operatoru Azərbaycan
                          Respublikasının qanunvericiliyinə uyğun təsis edilmiş
                          <strong>
                            "Metanoia" Məhdud Məsuliyyətli Cəmiyyətidir
                          </strong>
                          (bundan sonra –<strong>Şirkət</strong>
                          ).
                        </li>

                        <li>
                          1.3. Platformada Satıcı kimi qeydiyyatdan keçən fiziki
                          və ya hüquqi şəxs (bundan sonra –
                          <strong>Satıcı</strong>) bu Müqaviləni elektron
                          qaydada təsdiq etməklə onun bütün şərtlərini
                          qeyd-şərtsiz qəbul etdiyini təsdiqləyir.
                        </li>
                        <li>
                          1.4. Müqavilə Azərbaycan Respublikasının Mülki
                          Məcəlləsinə, “Elektron ticarət haqqında”,
                          “İstehlakçıların hüquqlarının müdafiəsi haqqında”,
                          “Vergilər Məcəlləsi”, “Şəxsi məlumatlar haqqında”
                          qanunlara, habelə beynəlxalq marketplace pr
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        2. PLATFORMANIN HÜQUQİ MODELİ{" "}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          2.1. Bu Müqavilənin predmeti Satıcının Platforma
                          üzərindən halal tələblərinə uyğun məhsullarını satışa
                          çıxarması, Şirkətin isə texnoloji platforma, ödəniş
                          infrastrukturu, sifarişlərin idarə edilməsi və müştəri
                          interfeysi təqdim etməsidir.
                        </li>
                        <li>
                          2.2 Platforma elektron marketplace modelinə əsaslanır
                          və Şirkət Satıcı ilə alıcı arasında texnoloji, maliyyə
                          və inzibati vasitəçi qismində çıxış edir.
                        </li>
                        <li>
                          2.3 Satıcı Platformada yerləşdirilən məhsulların
                          birbaşa satıcısıdır və məhsullarla bağlı bütün hüquqi
                          və maliyyə məsuliyyətini daşıyır.
                        </li>{" "}
                        <li>
                          2.4 Bu Müqavilə Satıcı ilə Şirkət arasında əmək,
                          agentlik, distribütorluq və ya tərəfdaşlıq
                          münasibətləri yaratmır.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        3. SATICININ QEYDİYYATI VƏ YOXLANMASI (KYC){" "}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          3.1. Satıcı yalnız qanunvericiliyə uyğun hüquq
                          qabiliyyətinə malik olduqda Platformada fəaliyyət
                          göstərə bilər.
                        </li>
                        <li>
                          3.2. Satıcı qeydiyyat zamanı təqdim etdiyi
                          məlumatların düzgünlüyünə və aktuallığına görə tam
                          məsuliyyət daşıyır.
                        </li>
                        <li>
                          3.3. Şirkət Satıcının təqdim etdiyi sənədləri və
                          məlumatları yoxlamaq, əlavə sənədlər tələb etmək və
                          Satıcının statusunu təsdiqləməmək hüququna malikdir.
                        </li>{" "}
                        <li>
                          3.4 Satıcı qeydiyyat zamanı düzgün, tam və aktual
                          məlumatlar təqdim etməyə borcludur.
                        </li>{" "}
                        <li>
                          3.5. Şirkət Satıcının hüquqi statusunu, vergi
                          qeydiyyatını, bank rekvizitlərini və digər
                          məlumatlarını istənilən vaxt yoxlamaq hüququna
                          malikdir.
                        </li>
                        <li>
                          3.6. Şirkət hər hansı uyğunsuzluq, qanun pozuntusu və
                          s. bu kimi hallar aşkar etdikdə və ya bununla bağlı
                          əsaslı şübhələr olduqda Satıcının fəaliyyətini
                          müvəqqəti və ya daimi dayandıra bilər.
                        </li>{" "}
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        4. MƏHSULLARA DAİR TƏLƏBLƏR VƏ HALAL UYĞUNLUQ
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          4.1. Satıcı yalnız Azərbaycan Respublikasının
                          qanunvericiliyinə və halal prinsiplərinə uyğun
                          məhsullar yerləşdirə bilər.
                        </li>

                        <li>
                          4.2. Satıcı məhsulların halal statusuna dair bütün
                          sübutları təqdim etməyə borcludur.
                        </li>

                        <li>
                          4.3. Halal statusu ilə bağlı iddialar zamanı bütün
                          hüquqi məsuliyyət Satıcının üzərinə düşür.
                        </li>

                        <li>
                          4.4 Satıcı məhsulların:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>keyfiyyətinə;</li>
                            <li>təhlükəsizliyinə;</li>
                            <li>halal statusuna;</li>
                            <li>sertifikatlaşdırılmasına (zəruri olduqda);</li>
                            <li>
                              təsvirlərinin doğruluğuna birbaşa məsuliyyət
                              daşıyır.
                            </li>
                          </ul>
                        </li>

                        <li>
                          <strong>
                            4.5 Halal statusu ilə bağlı iddialar zamanı bütün
                            hüquqi məsuliyyət Satıcının üzərinə düşür.
                          </strong>
                        </li>

                        <li>
                          4.5.1 Satıcı Platformada yerləşdirdiyi hər bir
                          məhsulun halal prinsiplərinə uyğunluğuna görə tam
                          məsuliyyət daşıyır.
                        </li>

                        <li>
                          4.5.2 Satıcı tərəfindən təqdim edilən halal
                          sertifikatlarının, etiketlərin və digər məlumatların
                          düzgünlüyünə, qüvvədə olmasına və həqiqiliyinə görə
                          bütün hüquqi, maliyyə və dini məsuliyyət, o cümlədən
                          vəbal satıcının üzərindədir.
                        </li>

                        <li>
                          4.5.3 Halal uyğunluqla bağlı üçüncü şəxslərin iradları
                          nəticəsində Metanoia MMC-yə qarşı irəli sürülə biləcək
                          bütün iddialar satıcı tərəfindən tam həcmdə
                          qarşılanır.
                        </li>

                        <li>
                          4.6. Şirkət reputasiya və hüquqi riskləri nəzərə
                          alaraq məhsulları birtərəfli qaydada Platformadan
                          müvəqqəti və ya daimi silə bilər.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        5. QİYMƏTLƏNDİRMƏ, KOMİSSİYA VƏ ÖDƏNİŞLƏR
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          5.1. Məhsulların satış qiyməti Satıcı tərəfindən
                          müəyyən edilir.
                        </li>

                        <li>
                          5.2. Platforma vasitəsilə satılmış hər bir məhsul üzrə
                          faktiki satış məbləğinin 10% (on faiz) həcmində xidmət
                          və vasitəçilik haqqı Şirkət tərəfindən tutulur.
                        </li>

                        <li>
                          5.3. Şirkət bazar şəraiti, kampaniyalar və risk
                          siyasətinə uyğun olaraq komissiya faizini birtərəfli
                          qaydada dəyişmək hüququna malikdir.
                        </li>

                        <li>
                          5.4. Satıcıya ödənişlər tamamlanmış sifarişlər üzrə
                          minimum 3 (üç) təqvim günündən bir həyata keçirilə
                          bilər.
                        </li>

                        <li>
                          5.5. Ödənişlərin köçürülməsi zamanı aşağıdakılar
                          nəzərə alınır:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>qaytarılma müddətləri;</li>
                            <li>mübahisəli sifarişlər;</li>
                            <li>texniki və ya hüquqi yoxlamalar.</li>
                          </ul>
                        </li>

                        <li>
                          5.6. Qaytarılmış, mübahisəli və ya şübhəli sifarişlər
                          üzrə ödənişlər dondurula bilər.
                        </li>

                        <li>
                          5.7. Şirkət zəruri hallarda Satıcıya ödənişlərin
                          köçürülməsini müvəqqəti dayandırmaq və ya gecikdirmək
                          hüququna malikdir.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        6. GERİ ÖDƏMƏ (CHARGEBACK), FRAUD (FIRILDAQ) VƏ RİSKLƏR
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          6.1. Bank və ödəniş sistemləri tərəfindən tətbiq
                          olunan chargeback halları Satıcının balansından
                          tutulur.
                        </li>

                        <li>
                          6.2. Fraud və ya saxtakarlıq şübhəsi olduqda Şirkət
                          ödənişləri dayandıra və Satıcının hesabını bağlaya
                          bilər.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        7. ÇATDIRILMA VƏ LOJİSTİKA
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          7.1. Məhsulların çatdırılması Satıcı tərəfindən və ya
                          Şirkətin təqdim etdiyi logistika həlləri vasitəsilə
                          həyata keçirilə bilər.
                        </li>

                        <li>
                          7.2. Satıcı çatdırılma zamanı məhsulun salamat və
                          vaxtında alıcıya təqdim edilməsinə görə məsuliyyət
                          daşıyır.
                        </li>

                        <li>
                          7.3. Çatdırılma ilə bağlı yaranan iddialar üzrə Satıcı
                          Şirkətlə birgə əməkdaşlıq etməlidir.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        8. QAYTARILMA, DƏYİŞDİRMƏ VƏ CƏRİMƏLƏR
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          8.1. Məhsulların qaytarılması və dəyişdirilməsi
                          Azərbaycan Respublikasının qanunvericiliyinə uyğun
                          həyata keçirilir.
                        </li>
                        <li>
                          8.2. Satıcı Şirkətlə koordinasiyalı şəkildə qaytarılma
                          və dəyişdirmə proseslərində iştirak etməyə borcludur.
                        </li>
                        <li>
                          8.3. Qaytarılma nəticəsində yaranan maliyyə
                          öhdəlikləri Satıcının balansından tutulmaqla
                          tənzimlənə bilər.
                        </li>{" "}
                        <li>
                          8.4. Satıcının gecikməsi və ya pozuntusu zamanı
                          cərimələr tətbiq oluna bilər.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        9. VERGİ VƏ MALİYYƏ MƏSULİYYƏTİ
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          9.1. Satıcı öz fəaliyyətindən yaranan bütün vergi,
                          rüsum və digər məcburi ödənişlərə görə müstəqil
                          məsuliyyət daşıyır.
                        </li>

                        <li>
                          9.2. Şirkət Satıcının vergi öhdəliklərinə görə
                          məsuliyyət daşımır.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        10. İNTELLEKTUAL MÜLKİYYƏT
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          10.1. Satıcı Platformada yerləşdirdiyi mətn, şəkil və
                          digər materialların istifadəsinə dair bütün hüquqlara
                          malik olduğunu təsdiqləyir.
                        </li>

                        <li>
                          10.2. Satıcı Platformaya yerləşdirdiyi kontentə görə
                          tam məsuliyyət daşıyır.
                        </li>

                        <li>
                          10.3. Satıcı Şirkətə həmin materiallardan Platformanın
                          fəaliyyəti məqsədilə istifadə üçün qeyri-eksklüziv,
                          ödənişsiz lisenziya verir.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        11. İNDEMNİFİKASİYA
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          11.1. Şirkət Satıcının məhsullarına dair üçüncü
                          şəxslərin iddialarına görə məsuliyyət daşımır.
                        </li>

                        <li>
                          11.2. Satıcı üçüncü şəxslərin iddiaları nəticəsində
                          Şirkətə dəyən zərərləri tam həcmdə ödəməyə borcludur.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        12. MÜQAVİLƏNİN DAYANDIRILMASI VƏ XİTAMI
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          12.1. Şirkət Müqaviləni birtərəfli qaydada dayandıra
                          bilər.
                        </li>

                        <li>
                          12.2. Müqavilənin xitamı Satıcının mövcud
                          öhdəliklərini aradan qaldırmır.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">13. FORS-MAJOR</p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          13.1. Fors-major hallarında tərəflər məsuliyyətdən
                          azad edilir.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        14. MÜBAHİSƏLƏRİN HƏLLİ
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          14.1. Mübahisələr danışıqlar yolu ilə həll edilməyə
                          çalışılır.
                        </li>

                        <li>
                          14.2. Razılaşma əldə olunmadıqda mübahisələr
                          Azərbaycan Respublikasının məhkəmələrində həll edilir.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        15. YEKUN MÜDDƏALAR
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          15.1. Müqavilə elektron qaydada təsdiq edildiyi andan
                          qüvvəyə minir.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* satici davranisi */}
                <div className="border-b pb-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
                    JUMMA PLATFORMASI ÜZRƏ SATICI DAVRANIŞ QAYDALARI{" "}
                  </h2>
                  <p className="mb-4 italic text-gray-600">
                    Bu Satıcı Davranış Qaydaları (bundan sonra – Qaydalar) Jumma
                    platformasında fəaliyyət göstərən bütün satıcılar üçün
                    məcburi davranış standartlarını müəyyən edir.{" "}
                    <strong>
                      Qaydalar Satıcı Müqaviləsinin ayrılmaz tərkib hissəsidir{" "}
                    </strong>
                    və onların pozulması hüquqi və maliyyə nəticələri yarada
                    bilər.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        1. Ümumi prinsiplər
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          1.1. Satıcı fəaliyyətini dürüstlük, şəffaflıq,
                          məsuliyyət və istehlakçıya hörmət prinsipləri əsasında
                          qurmalıdır.
                        </li>

                        <li>
                          1.2. Satıcı Jumma platformasının nüfuzuna, ictimai
                          etibara və dini-həssas dəyərlərə zərər vura biləcək
                          hərəkətlərdən çəkinməlidir.
                        </li>

                        <li>
                          1.3. Satıcı Azərbaycan Respublikasının
                          qanunvericiliyinə və bu Qaydalara tam riayət etməyə
                          borcludur.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        2. Məhsul yerləşdirilməsi və təqdimatı{" "}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          2.1. Satıcı yalnız qanuni dövriyyəsinə icazə verilən,
                          halal prinsiplərinə uyğun və təhlükəsiz məhsullar
                          yerləşdirə bilər.
                        </li>

                        <li>
                          2.2. Məhsulun adı, təsviri, tərkibi, istifadə qaydası
                          və digər məlumatlar
                          <strong>dəqiq, tam və çaşdırıcı olmayan</strong>
                          formada göstərilməlidir.
                        </li>

                        <li>
                          2.3. Saxta, mənşəyi məlum olmayan, vaxtı keçmiş və ya
                          sağlamlıq üçün təhlükəli məhsulların yerləşdirilməsi
                          qadağandır.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        3. Halal uyğunluq və etik məsuliyyət{" "}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          3.1. Satıcı məhsulun halal statusuna görə tam
                          məsuliyyət daşıyır.
                        </li>

                        <li>
                          3.2. Halal uyğunluq barədə yalan, şişirdilmiş və ya
                          təsdiqlənməmiş iddialar irəli sürmək qadağandır.
                        </li>
                        <li>
                          3.3. Jumma platforması halal mövzusunda ictimai
                          etimadı qorumaq məqsədilə məhsulları yoxlamaq və
                          silmək hüququnu saxlayır.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        4. Qiymət siyasəti və ədalətli satış{" "}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          4.1. Qiymətlər süni şəkildə şişirdilməməli və
                          istehlakçını aldadacaq formada təqdim edilməməlidir.
                        </li>

                        <li>
                          4.2. Kampaniya və endirimlər real və əsaslandırılmış
                          olmalıdır.
                        </li>

                        <li>
                          4.3. Eyni məhsul üçün fərqli istifadəçilərə əsassız
                          qiymət fərqləri tətbiq etmək qadağandır.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        5. Sifarişlərin icrası və çatdırılma{" "}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          5.1. Satıcı sifarişləri vaxtında və düzgün şəkildə
                          icra etməlidir.
                        </li>

                        <li>
                          5.2. Çatdırılma zamanı məhsulun zədələnməməsi və
                          təhlükəsizliyi təmin olunmalıdır.
                        </li>

                        <li>
                          5.3. Çatdırılma ilə bağlı problemlər barədə Jumma
                          dərhal məlumatlandırılmalıdır.
                        </li>
                      </ul>
                    </div>{" "}
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        6. Qaytarılma, dəyişdirmə və şikayətlər{" "}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          6.1. Satıcı qanunvericiliklə nəzərdə tutulmuş
                          qaytarılma və dəyişdirmə hüquqlarına hörmət etməlidir.
                        </li>

                        <li>
                          6.2. İstifadəçi şikayətlərinə vaxtında və etik şəkildə
                          cavab verilməlidir.
                        </li>

                        <li>
                          6.3. Jumma tərəfindən aparılan araşdırmalar zamanı
                          satıcı tam əməkdaşlıq etməlidir.
                        </li>
                      </ul>
                    </div>{" "}
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        7. Ünsiyyət və davranış etikası{" "}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          7.1. İstifadəçilərlə və Jumma nümayəndələri ilə
                          ünsiyyətdə təhqiredici, hədələyici və ya hörmətsiz
                          davranış qadağandır.
                        </li>

                        <li>
                          7.2. Platforma xaricində istifadəçilərlə qeyri-qanuni
                          əlaqə qurmaq və ya məlumat tələb etmək qadağandır.
                        </li>
                      </ul>
                    </div>{" "}
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        8. Qanunsuz və qadağan olunmuş fəaliyyətlər{" "}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          8.1. Saxtakarlıq, yalan sifarişlər, süni reytinq
                          formalaşdırılması və oxşar fəaliyyətlər qadağandır.
                        </li>

                        <li>
                          8.2. Platformanın texniki sistemlərinə müdaxilə etmək,
                          boşluqlardan sui-istifadə etmək qadağandır.
                        </li>
                      </ul>
                    </div>{" "}
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        9. Məlumatların qorunması{" "}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          9.1. Satıcı istifadəçilərin şəxsi məlumatlarını yalnız
                          sifarişin icrası məqsədilə istifadə edə bilər.
                        </li>

                        <li>
                          9.2. Şəxsi məlumatların üçüncü şəxslərə ötürülməsi
                          qadağandır.
                        </li>
                      </ul>
                    </div>{" "}
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        10. NƏZARƏT VƏ SANKSİYALAR
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          10.1. Bu Qaydaların pozulması hallarında Jumma
                          aşağıdakı tədbirləri görə bilər:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>xəbərdarlıq;</li>
                            <li>məhsulların silinməsi;</li>
                            <li>hesabın müvəqqəti məhdudlaşdırılması;</li>
                            <li>hesabın daimi bağlanması;</li>
                            <li>maliyyə tutulmaları və cərimələr.</li>
                          </ul>
                        </li>

                        <li>
                          10.2. Tədbirlərin seçilməsi pozuntunun ağırlıq
                          dərəcəsindən asılıdır.
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        11. Yekun müddəalar{" "}
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          11.1. Satıcı bu Qaydalarla tanış olduğunu və onlara
                          riayət edəcəyini təsdiqləyir.
                        </li>

                        <li>
                          11.2. Jumma bu Qaydaları birtərəfli qaydada yeniləmək
                          hüququnu saxlayır.
                        </li>

                        <li>11.3. Qaydalar yeniləndiyi andan qüvvəyə minir.</li>
                      </ul>
                    </div>{" "}
                  </div>
                </div>

                {/* sikayetler haqqinda */}

                <div className="border-b pb-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
                    HALAL UYĞUNLUQ ÜZRƏ ŞİKAYƏT VƏ ARAŞDIRMA PROSEDURU{" "}
                  </h2>
                  <p>
                    Bu sənəd Jumma platformasında məhsulların halal uyğunluğu
                    ilə bağlı daxil olan şikayətlərin qəbul edilməsi,
                    araşdırılması və nəticələndirilməsi üzrə operativ mexanizmi
                    müəyyən edir.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        1. ŞİKAYƏTİN QƏBULU
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          1.1. Halal uyğunluqla bağlı şikayətlər aşağıdakı
                          kanallar vasitəsilə qəbul edilir:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>mobil tətbiq daxilində müraciət forması;</li>
                            <li>rəsmi elektron poçt ünvanı;</li>
                            <li>müştəri dəstək xətti.</li>
                          </ul>
                        </li>

                        <li>
                          1.2. Şikayət aşağıdakı məlumatları ehtiva etməlidir:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>sifariş nömrəsi;</li>
                            <li>məhsulun adı;</li>
                            <li>şikayətin mahiyyəti;</li>
                            <li>mümkün sübutlar və ya əsaslandırmalar.</li>
                          </ul>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        2. İLKİN YOXLAMA
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          2.1. Şikayət daxil olduqdan sonra Platforma tərəfindən
                          ilkin hüquqi və texniki yoxlama aparılır.
                        </li>

                        <li>
                          2.2. Şikayətin əsassız olduğu açıq şəkildə görünərsə,
                          müraciət əsaslandırılmış cavabla bağlana bilər.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        3. SÜBHƏ VƏ SƏNƏDLƏR
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          3.1. Əsaslı şübhə yarandığı hallarda satıcıdan
                          aşağıdakı sənədlər tələb oluna bilər:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>halal sertifikatının surəti;</li>
                            <li>sertifikatlaşdırma orqanı haqqında məlumat;</li>
                            <li>
                              məhsul tərkibi və istehsal prosesi barədə izahat.
                            </li>
                          </ul>
                        </li>

                        <li>
                          3.2. Satıcı tələb edilən məlumatları müəyyən edilmiş
                          müddət ərzində təqdim etməlidir.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        4. MÜVƏQQƏTİ TƏDBİRLƏR
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          4.1. Araşdırma müddətində Platforma aşağıdakı
                          tədbirləri görə bilər:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>məhsulun satışdan müvəqqəti çıxarılması;</li>
                            <li>
                              məhsul üzərində “araşdırılır” qeydinin
                              yerləşdirilməsi;
                            </li>
                            <li>
                              satıcının müvafiq məhsul üzrə satışının
                              dayandırılması.
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        5. QƏRARIN QƏBUL EDİLMƏSİ
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          5.1. Araşdırma nəticəsində:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              halal uyğunluq təsdiqlənərsə, məhsul yenidən
                              aktivləşdirilir;
                            </li>
                            <li>
                              uyğunluq pozuntusu aşkarlanarsa, məhsul silinir və
                              satıcıya sanksiya tətbiq edilir.
                            </li>
                          </ul>
                        </li>

                        <li>
                          5.2. Tətbiq edilə biləcək sanksiyalar:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>xəbərdarlıq;</li>
                            <li>hesabın müvəqqəti məhdudlaşdırılması;</li>
                            <li>hesabın daimi bağlanması.</li>
                          </ul>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        6. HÜQUQİ NƏTİCƏLƏR
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          6.1. Halal uyğunluğun pozulması ilə bağlı bütün hüquqi
                          və maliyyə nəticələrinə görə məsuliyyət satıcının
                          üzərindədir.
                        </li>

                        <li>
                          6.2. Metanoia MMC bu prosedur çərçivəsində
                          koordinasiyaedici rol icra edir.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        7. ÜMUMİ MÜDDƏALAR
                      </p>

                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          7.1. Bu Prosedur daxili normativ sənəd olmaqla
                          Platformada tətbiq edilir.
                        </li>

                        <li>
                          7.2. Prosedur Platforma tərəfindən birtərəfli qaydada
                          yenilənə bilər.
                        </li>

                        <li>
                          7.3. Prosedur Halal Uyğunluq Siyasətinin icra
                          mexanizmi kimi çıxış edir.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* halal uygunluq siyaseti */}
                <div className="border-b pb-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
                    JUMMA PLATFORMASI ÜZRƏ HALAL UYĞUNLUQ SİYASƏTİ
                  </h2>

                  <p className="mb-4 italic text-gray-600">
                    Bu Halal Uyğunluq Siyasəti (bundan sonra –
                    <strong>Siyasət</strong>) Jumma mobil tətbiqi və platforması
                    üzərindən satışa təqdim olunan məhsulların halal
                    prinsiplərinə uyğunluğuna dair ümumi çərçivəni, tərəflərin
                    məsuliyyət bölgüsünü və nəzarət mexanizmlərini müəyyən edir.
                    Bu Siyasət
                    <strong>
                      İstifadəçi Müqaviləsinin və Satıcı Müqaviləsinin ayrılmaz
                      tərkib hissəsidir.
                    </strong>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        1. ÜMUMİ PRİNSİPLƏR
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          1.1. Jumma platforması halal dəyərlərə əsaslanan
                          elektron ticarət və sosial xidmət platforması kimi
                          fəaliyyət göstərir.
                        </li>
                        <li>
                          1.2. Platformada təqdim olunan məhsulların halal
                          uyğunluğu əsasən satıcılar tərəfindən təqdim edilən
                          məlumatlar, sənədlər və məhsul üzərində yerləşdirilmiş
                          halal nişanları əsasında formalaşır.
                        </li>
                        <li>
                          1.3. Bu Siyasət Azərbaycan Respublikasının
                          qanunvericiliyinə və beynəlxalq halal standartlarına
                          uyğun hazırlanıb.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        2. HALAL UYĞUNLUĞUNUN ƏSASLANDIRILMASI
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          2.1. Satıcı hər bir məhsul üçün aşağıdakılardan azı
                          birini təmin etməlidir:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Müvafiq halal sertifikatlaşdırma qurumu tərəfindən
                              verilmiş halal sertifikatı;
                            </li>
                            <li>
                              Məhsulun qablaşdırması üzərində açıq “halal”
                              nişanı.
                            </li>
                          </ul>
                        </li>
                        <li>
                          2.2. Platforma məhsulun halal statusunu yalnız satıcı
                          tərəfindən təqdim edilən sənədlər və etiket
                          məlumatları əsasında göstərir.
                        </li>
                        <li>
                          2.3. Halal sertifikatlarının həqiqiliyi və
                          etibarlılığı satıcının üzərindədir.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        3. BEYNƏLXALQ HALAL STANDARTLARINA İSTİNAD
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          3.1. Nəzərə alınan beynəlxalq yanaşmalar:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Halal məhsulların istehsalı, emalı və dövriyyəsi
                              üzrə islam hüququ prinsipləri;
                            </li>
                            <li>
                              Beynəlxalq halal sertifikatlaşdırma praktikaları;
                            </li>
                            <li>
                              İstehlakçıların məlumatlandırılması və
                              aldadılmasının qarşısının alınması prinsipləri.
                            </li>
                          </ul>
                        </li>
                        <li>
                          3.2. Platforma müxtəlif ölkələrdə fərqli halal
                          standartlarını nəzərə alır və təqdim olunan
                          məlumatları informasiya xarakterli hesab edir.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        4. SATIÇININ MƏSULİYYƏTİ
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          4.1. Satıcı məsuliyyət daşıyır:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Məhsulun faktiki halal prinsiplərinə uyğun olması;
                            </li>
                            <li>
                              Halal sertifikatlarının və etiket məlumatlarının
                              düzgünlüyü;
                            </li>
                            <li>
                              Məhsul tərkibində halal olmayan maddələrin
                              olmaması.
                            </li>
                          </ul>
                        </li>
                        <li>
                          4.2. Haramsız və ya yanlış təqdimat hallarında hüquqi,
                          maliyyə və mənəvi məsuliyyət satıcının üzərindədir.
                        </li>
                        <li>
                          4.3. Satıcı üçüncü şəxslərin iradlarına görə Metanoia
                          MMC-ni azad edir.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        5. PLATFORMANIN MÖVQEYİ VƏ MƏHDUDİYYƏTLƏR
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          5.1. Metanoia MMC məhsulun istehsalçısı olmadığı üçün
                          halal uyğunluğu yoxlamaq öhdəliyi daşımır.
                        </li>
                        <li>
                          5.2. Platforma təqdim olunan məlumatların doğruluğuna
                          zəmanət vermir, lakin şikayət və əsaslı şübhə
                          hallarında tədbirlər görmək hüququnu saxlayır.
                        </li>
                        <li>
                          5.3. Platforma birtərəfli olaraq:
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>
                              Mübahisəli məhsulu müvəqqəti və ya daimi silə
                              bilər;
                            </li>
                            <li>Satıcıdan əlavə sənəd tələb edə bilər;</li>
                            <li>
                              Satıcının hesabını məhdudlaşdıra və ya bağlaya
                              bilər.
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        6. İSTİFADƏÇİLƏR ÜÇÜN MƏLUMATLANDIRMA
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          6.1. Platformada göstərilən halal məlumatları
                          istifadəçinin məlumatlandırılması məqsədini daşıyır.
                        </li>
                        <li>
                          6.2. İstifadəçi əlavə sualları birbaşa satıcıya və ya
                          Platformanın dəstək kanallarına ünvanlaya bilər.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        7. MÜBAHİSƏLƏR VƏ ŞİKAYƏTLƏR
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          7.1. Halal uyğunluqla bağlı daxil olan şikayətlər
                          Platforma tərəfindən araşdırılır və satıcıdan izahat
                          tələb oluna bilər.
                        </li>
                        <li>
                          7.2. Araşdırma nəticəsində pozuntular təsdiqlənərsə,
                          Platforma sanksiyalar tətbiq edə bilər.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-bold text-gray-800">
                        8. YEKUN MÜDDƏALAR
                      </p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>
                          8.1. Siyasət Platformada dərc edildiyi andan qüvvəyə
                          minir.
                        </li>
                        <li>
                          8.2. Metanoia MMC Siyasəti birtərəfli qaydada yeniləyə
                          bilər.
                        </li>
                        <li>
                          8.3. Siyasətə dair mübahisələr Azərbaycan
                          qanunvericiliyinə uyğun həll edilir.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setopenterms(false)}
                  className="bg-green-600 cursor-pointer text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Bağla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Register CTA */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => setView("login")}
            className="text-green-600 flex flex-row justify-center gap-x-5 text-xl border rounded-2xl mt-4 py-2 w-full cursor-pointer font-semibold hover:text-green-700 hover:scale-110 transition-all"
          >
            Əsas səhifəyə qayıt
            <ArrowRight size={30} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Satıcı Login

const SaticiLogin = ({ setView }) => {
  const [loading, setLoading] = useState(false);
  const { browser, os } = useGetClientInfo();
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        API_URLS.SATICI.LOGIN,
        {
          email: form.email,
          password: form.password,
          isWeb: true,
          os,
          browser,
          platform: "web",
        },
        { withCredentials: true }
      );
      const data = res.data;

      toast.success(`Giriş uğurludur. Xoş gəldin ${data?.user?.ad}`);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("role", data.user.role);

      dispatch(
        setauthdata({
          user: data.user,
          role: "satici",
          accessToken: data.accessToken,
        })
      );

      navigate("/satici");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.hata || "Giriş uğursuzdur!");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !form.email || !form.password;

  return (
    <div className="max-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-50 pt-14 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-green-100 shadow-2xl rounded-2xl p-8">
        <div className="flex flex-col items-center">
          <div className="bg-green-600 text-white p-3 rounded-full mb-3 shadow-md">
            <LockKeyhole size={28} />
          </div>
          <h2 className="text-3xl font-bold text-center text-green-700 mb-2">
            Satıcı Girişi
          </h2>
          <p className="text-center text-gray-500 mb-6 text-sm">
            Hesabınıza giriş etmək üçün bilgilərinizi daxil edin
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              E-poçt ünvanı
            </label>
            <input
              type="email"
              name="email"
              placeholder="ornək@satici.com"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-200 duration-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-md p-3 outline-none transition-all"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Şifrə
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-200 duration-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-md p-3 outline-none transition-all pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-green-500 transition"
              >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isDisabled || loading}
            className={`flex text-2xl items-center justify-center gap-2 cursor-pointer bg-green-600 text-white font-medium py-3 rounded-md transition-all ${
              isDisabled || loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-green-700 hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <span className="animate-pulse">Giriş edilir...</span>
            ) : (
              <>
                <LogIn size={24} /> Giriş et
              </>
            )}
          </button>
        </form>

        <div className="flex flex-row justify-center my-4 gap-x-2">
          <p>Şifrəni unutmusan?</p>
          <button
            onClick={() => navigate("resetpassword")}
            className="text-green-600 font-semibold cursor-pointer hover:scale-110 duration-200 transition-all ease-in"
          >
            Parolu sıfırla
          </button>
        </div>
        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-600"></div>
          <span className="text-gray-400 text-sm">və ya</span>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>

        {/* Register CTA */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-gray-600">Hesabın yoxdur?</span>
          <button
            type="button"
            onClick={() => setView("register")}
            className="text-green-600 cursor-pointer font-semibold hover:text-green-800 hover:scale-110 transition-all"
          >
            Qeydiyyatdan keç
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          © {new Date().getFullYear()} Satıcı Paneli
        </p>
      </div>
    </div>
  );
};

// Admin Login
const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Admin login fonksiyonu çalıştı");

    try {
      setLoading(true);
      const res = await axios.post(API_URLS.ADMIN.ADMINLOGIN, form, {
        withCredentials: true,
      });
      const data = res.data;
      console.log("user:", data.user);
      console.log("data:", data);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("role", data?.user?.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch(
        setauthdata({
          user: data.user,
          role: data?.user?.role,
          accessToken: data?.accessToken,
        })
      );
      navigate("/admin");
      toast.success("Giriş uğurludur!");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.hata || "Giriş uğursuzdur!");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !form.email || !form.password;

  return (
    <div className="max-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50 px-4 pt-14">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-600 text-white p-3 rounded-full mb-3 shadow-md">
            <LockKeyhole size={28} />
          </div>
          <h2 className="text-3xl text-gray-800 tracking-tight">
            Admin Girişi
          </h2>
          <p className="text-gray-500 text-sm mt-1 font-poppins">
            Admin panelinə çatmaq üçün admin bilgilərinizi daxil edin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Input */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              E-poçt ünvanı
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@sayt.com"
              required
              autoComplete="email"
              className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-md p-3 outline-none transition-all"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Şifrə
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-md p-3 outline-none transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3 text-gray-500 hover:text-green-500 transition"
              >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isDisabled || loading}
            className={`flex items-center justify-center gap-2 text-2xl bg-green-600 text-white font-medium py-3 rounded-md transition-all ${
              isDisabled || loading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-green-700 hover:scale-[1.02]"
            }`}
          >
            {loading ? "Giriş edilir..." : "Giriş et"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6 tracking-tight">
          © {new Date().getFullYear()} Admin Paneli
        </p>
      </div>
    </div>
  );
};

// Home Component
export default function Home() {
  const [view, setView] = useState("login"); // home | login | register
  const [activeRole, setActiveRole] = useState("satici");

  const roles = [
    { key: "satici", label: "Satıcı" },
    { key: "admin", label: "Admin" },
  ];

  const renderContent = () => {
    if (view === "register") return <SaticiRegister setView={setView} />;

    if (view === "login")
      return (
        <>
          {/* Switch Buttons */}
          <div className="flex gap-6 mt-6 w-full max-w-md justify-center">
            {roles.map((role) => (
              <button
                key={role.key}
                onClick={() => setActiveRole(role.key)}
                className={`pb-2 px-4 text-lg font-medium transition-all cursor-pointer duration-300 ${
                  activeRole === role.key
                    ? "border-b-4 border-green-600"
                    : "border-b-4 border-gray-300"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Login Form */}
          <div className="w-full">
            {activeRole === "satici" ? (
              <SaticiLogin setView={setView} />
            ) : (
              <AdminLogin />
            )}
          </div>
        </>
      );
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center">
      <nav className="h-20 w-full flex items-center justify-center bg-green-500">
        <img src={mescidaglogo} alt="logo" className="h-16" />
      </nav>

      {renderContent()}
    </div>
  );
}
