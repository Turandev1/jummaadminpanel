//
//
//

//

//

// export const API_BASE_URL = "http://localhost:5000";

export const API_BASE_URL = "https://jummabackendapi.onrender.com";

export const ADMIN_URL = `${API_BASE_URL}/webapi/admin`;

export const API_URLS = {
  IMAM: {
    IMAMSIGNUP: `${API_BASE_URL}/webapi/imam/imamsignup`,
    IMAMLOGIN: `${API_BASE_URL}/webapi/imam/imamlogin`,
    EDITIMAMACC: `${API_BASE_URL}/webapi/imam/editimamacc`,
    GETME: `${API_BASE_URL}/webapi/imam/getme`,
    IANEREQUEST: `${API_BASE_URL}/webapi/imam/setiane`,
    REFRESHTOKEN: `${API_BASE_URL}/webapi/imam/refreshtoken`,
    LOGOUT: `${API_BASE_URL}/webapi/imam/logoutweb`,
  },
  ADMIN: {
    ADMINLOGIN: `${API_BASE_URL}/webapi/admin/admin-login`,
    LOGOUT: `${API_BASE_URL}/webapi/admin/admin-logout`,
    GETUSERS: `${API_BASE_URL}/webapi/admin/getusers`,
    GETADMINS: `${API_BASE_URL}/webapi/admin/getadmins`,
    GETMESCIDS: `${API_BASE_URL}/webapi/admin/getmescids`,
    GETSATICILAR: `${API_BASE_URL}/webapi/admin/getsaticilar`,
    GETORDERS: `${API_BASE_URL}/webapi/admin/getadminsifarisler`,
    GETME: `${API_BASE_URL}/webapi/admin/getme`,
    REFRESHTOKEN: `${API_BASE_URL}/webapi/admin/refreshToken`,
    EDITADMIN: `${API_BASE_URL}/webapi/admin/edit-admin`,
    GETIANELER: `${API_BASE_URL}/webapi/admin/get-ianeler`,
    MARKASREAD: `${API_BASE_URL}/webapi/admin/mark-asread`,
    MARKASUNREAD: `${API_BASE_URL}/webapi/admin/mark-asunread`,
    MARKASCOMPLETED: `${API_BASE_URL}/webapi/admin/mark-ascompleted`,
    APPROVEIANE: `${API_BASE_URL}/webapi/admin/approve-iane`,
    REJECTIANE: `${API_BASE_URL}/webapi/admin/reject-iane`,
    DELETEIANE: `${API_BASE_URL}/webapi/admin/delete-iane`,
    ACTIVATEMESCID: `${API_BASE_URL}/webapi/admin/activate-mescid`,
    EDITMESCID: `${API_BASE_URL}/webapi/admin/edit-mescid`,
    MESCIDQEYDET: `${API_BASE_URL}/webapi/admin/mescidqeydi`,
    SETIANE: `${API_BASE_URL}/webapi/admin/setiane`,
    SATICISIGNUP: `${API_BASE_URL}/webapi/satici/saticisignup`,
    ADMINSIGNUP: `${API_BASE_URL}/webapi/admin/adminsignup`,
    GETUSERMESSAGES: `${API_BASE_URL}/webapi/admin/getusermessages`,
    MARK_AS_READ: `${API_BASE_URL}/webapi/admin/toggleisread`,
    SENDRESPONSE: `${API_BASE_URL}/webapi/admin/sendresponse`,
    BLOCKSATICI: `${API_BASE_URL}/webapi/admin/blocksatici`,
    BLOCKDANCIXART: `${API_BASE_URL}/webapi/admin/blokdancixart`,
    WARNSATICI: `${API_BASE_URL}/webapi/admin/warnsatici`,
    GETSATİCİPRODUCTS: `${API_BASE_URL}/webapi/admin/getsaticiproducts`,
    TOGGLEPRODUCTSTATUS: `${API_BASE_URL}/webapi/admin/toggleproductstatus`,
    TOGGLEMURACIETREAD: `${API_BASE_URL}/webapi/admin/toggleread`,
    TOGGLEBLOCKPRODUCT: `${API_BASE_URL}/webapi/admin/toggleblockproduct`,
  },
  SATICI: {
    LOGIN: `${API_BASE_URL}/webapi/satici/login`,
    SATICISIGNUP: `${API_BASE_URL}/webapi/satici/saticisignup`,
    LOGOUT: `${API_BASE_URL}/webapi/satici/logout`,
    VERIFYME: `${API_BASE_URL}/webapi/satici/getme`,
    PROPHILEPHOTO: `${API_BASE_URL}/webapi/satici/profilephoto`,
    EDITACCOUNT: `${API_BASE_URL}/webapi/satici/edit-account`,
    MEHSULQOY: `${API_BASE_URL}/webapi/satici/mehsul-qoy`,
    GETPRODUCTS: `${API_BASE_URL}/webapi/satici/getproducts`,
    SENDVERIFYCODE: `${API_BASE_URL}/webapi/satici/sendverifycode`,
    VERIFYEMAILCODE: `${API_BASE_URL}/webapi/satici/verifyemailcode`,
    COMPLETEACCOUNTSETUP: `${API_BASE_URL}/webapi/satici/complete_account_setup`,
    MEHSULEDIT: `${API_BASE_URL}/webapi/satici/mehsuledit`,
    TOGGLEPRODUCTSTATUS: `${API_BASE_URL}/webapi/satici/toggleproductstatus`,
    DELETEPRODUCT: `${API_BASE_URL}/webapi/satici/deleteproduct`,
    SEND_CODE: `${API_BASE_URL}/webapi/satici/sendresetcode`,
    VERIFY_CODE: `${API_BASE_URL}/webapi/satici/verifyresetcode`,
    RESET_PASSWORD: `${API_BASE_URL}/webapi/satici/resetpassword`,
    GET_ORDERS: `${API_BASE_URL}/webapi/satici/getorders`,
    CHANGEPASSWORD: `${API_BASE_URL}/webapi/satici/changepassword`,
    CHANGEORDERSTATUS: `${API_BASE_URL}/webapi/satici/changeorderstatus`,
    DELETEANADDRESS: `${API_BASE_URL}/webapi/satici/deleteanaddress`,
    CHANGEEXISTINGADDRESS: `${API_BASE_URL}/webapi/satici/changeexistingaddress`,
    ADDNEWADDRESS: `${API_BASE_URL}/webapi/satici/addnewaddress`,
    TOGGLEPRODUCTTUKENDI: `${API_BASE_URL}/webapi/satici/toggleproducttukendi`,
    CHANGEDELIVERYOPTIONS: `${API_BASE_URL}/webapi/satici/changedeliveryoptions`,
  },
};
