import { environment } from "../../environments/environment"

const baseUrl = environment.apiUrl;
export const URLS = Object({
    //AuthLogin
    "AuthLogin": `${baseUrl}/Auth/login`,
    "AuthChangePassword": `${baseUrl}/Auth/ChangePassword`,

    //Admin
    "GetAllCustomers": `${baseUrl}/Admin/GetAllCustomers`,
    "GetCustomer": `${baseUrl}/Admin/GetCustomer`,
    "AdminLogin": `${baseUrl}/AdminLogin`,
    "CreateCustomer": `${baseUrl}/Admin/CreateCustomer`,
    "UpdateCustomer": `${baseUrl}/Admin/UpdateCustomer`,
    "DeleteCustomer": `${baseUrl}/Admin/DeleteCustomer`,

    //Chat
    "GetAllChat": `${baseUrl}/Chat/GetAllChat`,
    "GetMessages": `${baseUrl}/Chat/GetMessages`,
    "SaveMessages": `${baseUrl}/Chat/SaveMessages`,

    //User
    "GetUser": `${baseUrl}/User/GetUser`,
    "GetAllUser": `${baseUrl}/User/GetAllUser`,
    "CreateUser": `${baseUrl}/User/CreateUser`,
    "UpdateUser": `${baseUrl}/User/UpdateUser`,
    "DeleteUser": `${baseUrl}/User/DeleteUser`,
    "ChangeUserStatus": `${baseUrl}/User/ChangeUserStatus`,

    //Settings
    "SaveFile": `${baseUrl}/File/SaveFile`,
    "DeleteFile": `${baseUrl}/File/DeleteFile`,
    "UploadFile": `${baseUrl}/File/UploadFile`,
});