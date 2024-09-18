import { SignInInterface } from "../../interfaces/SignIn";
import { UsersInterface } from "../../interfaces/IUser";
import axios from "axios";

const apiUrl = "http://localhost:8000";

// ฟังก์ชันสำหรับการสร้าง Authorization Header
const getAuthHeader = () => {
  const token = localStorage.getItem("token"); // ดึง token จาก localStorage
  const tokenType = localStorage.getItem("token_type") || "Bearer"; // ตรวจสอบว่ามี token_type หรือไม่ หากไม่มีให้ใช้ Bearer เป็นค่า default
  return token ? `${tokenType} ${token}` : null;
};

// ฟังก์ชันสำหรับการล็อกอิน
async function SignIn(data: SignInInterface) {
  return await axios
    .post(`${apiUrl}/signin`, data)
    .then((res) => {
      // เมื่อผู้ใช้ล็อกอินสำเร็จ เก็บ token ใน localStorage
      const token = res.data.token;
      const tokenType = res.data.token_type || "Bearer";
      localStorage.setItem("token", token);
      localStorage.setItem("token_type", tokenType);
      return res;
    })
    .catch((e) => e.response);
}

// ฟังก์ชันสำหรับการจัดการผู้ใช้

// ดึงข้อมูลผู้ใช้ทั้งหมด
async function GetUsers() {
  return await axios
    .get(`${apiUrl}/users`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(), // ส่ง Authorization Header ในคำขอ
      },
    })
    .then((res) => res)
    .catch((e) => e.response);
}

// ดึงข้อมูลผู้ใช้ตาม ID
async function GetUserById(id: string) {
  return await axios
    .get(`${apiUrl}/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(), // ส่ง Authorization Header ในคำขอ
      },
    })
    .then((res) => res)
    .catch((e) => e.response);
}

// อัปเดตข้อมูลผู้ใช้ตาม ID
async function UpdateUserById(id: string, data: UsersInterface) {
  return await axios
    .put(`${apiUrl}/users/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(), // ส่ง Authorization Header ในคำขอ
      },
    })
    .then((res) => res)
    .catch((e) => e.response);
}

// ลบผู้ใช้ตาม ID
async function DeleteUserById(id: string) {
  return await axios
    .delete(`${apiUrl}/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(), // ส่ง Authorization Header ในคำขอ
      },
    })
    .then((res) => res)
    .catch((e) => e.response);
}

// สร้างผู้ใช้ใหม่
async function CreateUser(data: UsersInterface) {
  return await axios
    .post(`${apiUrl}/signup`, data, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(), // ส่ง Authorization Header ในคำขอ
      },
    })
    .then((res) => res)
    .catch((e) => e.response);
}

// อัปเดตพาสเวิร์ด
async function UpdatePasswordById(id: string, payload: { current_password: string, new_password: string }) {
  return await axios
    .put(`${apiUrl}/users/${id}/update-password`, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(), // ส่ง Authorization Header ในคำขอ
      },
    })
    .then((res) => res)
    .catch((e) => e.response);
}

// ดึงข้อมูลโปรไฟล์ของ tutor ตาม ID
async function GetTutorProfileById(UserID: string) {
  return await axios
    .get(`${apiUrl}/tutor_profiles/${UserID}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": getAuthHeader(), // ส่ง Authorization Header ในคำขอ
      },
    })
    .then((res) => res) // ส่งคืนผลลัพธ์ที่เป็น response
    .catch((e) => e.response); // ส่งคืนข้อผิดพลาดที่เกิดขึ้น
}


interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user_role_id: number;
}

const loginService = async (data: LoginData): Promise<LoginResponse> => {
  const response = await axios.post("/api/login", data);
  return response.data;
};

// Export ฟังก์ชันทั้งหมด
export {
  SignIn,
  GetUsers,
  GetUserById,
  UpdateUserById,
  DeleteUserById,
  CreateUser,
  UpdatePasswordById,
  loginService,
  GetTutorProfileById
};