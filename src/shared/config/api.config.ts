import { environment } from "../../environments/environment"

const baseUrl = environment.apiUrl;
export const URLS = Object({
    //AuthLogin
    "AuthLogin": `${baseUrl}/Auth/login`,
    "AuthChangePassword": `${baseUrl}/Auth/ChangePassword`,
    "AdminLogin": `${baseUrl}/Auth/AdminLogin`,

    //Admin
    "GetAllCustomers": `${baseUrl}/Admin/GetAllCustomers`,
    "GetCustomer": `${baseUrl}/Admin/GetCustomer`,
    "CreateCustomer": `${baseUrl}/Admin/CreateCustomer`,
    "UpdateCustomer": `${baseUrl}/Admin/UpdateCustomer`,
    "DeleteCustomer": `${baseUrl}/Admin/DeleteCustomer`,
    "GetAdminUsers": `${baseUrl}/Admin/GetAdminUsers`,

    //Chat
    "GetAllChat": `${baseUrl}/Chat/GetAllChat`,
    "GetMessages": `${baseUrl}/Chat/GetMessages`,
    "SaveMessages": `${baseUrl}/Chat/SaveMessages`,
    "ClearChat": `${baseUrl}/Chat/ClearChat`,
    "DeleteChat": `${baseUrl}/Chat/DeleteChat`,

    //User
    "GetUser": `${baseUrl}/User/GetUser`,
    "GetAllUser": `${baseUrl}/User/GetAllUser`,
    "CreateUser": `${baseUrl}/User/CreateUser`,
    "UpdateUser": `${baseUrl}/User/UpdateUser`,
    "DeleteUser": `${baseUrl}/User/DeleteUser`,
    "ChangeUserStatus": `${baseUrl}/User/ChangeUserStatus`,
    "GetBlockedUsers": `${baseUrl}/User/GetBlockedUsers`,
    "BlockUser": `${baseUrl}/User/BlockUser`,
    "UnblockUser": `${baseUrl}/User/UnblockUser`,

    //Settings
    "SaveFile": `${baseUrl}/File/SaveFile`,
    "DeleteFile": `${baseUrl}/File/DeleteFile`,
    "UploadFile": `${baseUrl}/File/UploadFile`,
    "SubmitFeedback": `${baseUrl}/Settings/SubmitFeedback`,

    // AI
    "SendMessage": `${baseUrl}/AI/SendMessage`,
    "GetAllSessions": `${baseUrl}/AI/GetAllSessions`,
    "GetSessionMessages": `${baseUrl}/AI/GetSessionMessages`,
    "RenameSession": `${baseUrl}/AI/RenameSession`,
    "DeleteSession": `${baseUrl}/AI/DeleteSession`,
});