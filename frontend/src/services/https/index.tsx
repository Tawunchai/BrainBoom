import { SignInInterface } from "../../interfaces/SignIn";
import { UsersInterface } from "../../interfaces/IUser";
import axios from "axios";
import { CourseInterface } from "../../interfaces/ICourse";

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
        Authorization: getAuthHeader(), // ส่ง Authorization Header ในคำขอ
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
        Authorization: getAuthHeader(), // ส่ง Authorization Header ในคำขอ
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
        Authorization: getAuthHeader(), // ส่ง Authorization Header ในคำขอ
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
        Authorization: getAuthHeader(), // ส่ง Authorization Header ในคำขอ
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
        Authorization: getAuthHeader(), // ส่ง Authorization Header ในคำขอ
      },
    })
    .then((res) => res)
    .catch((e) => e.response);
}

// อัปเดตพาสเวิร์ด
async function UpdatePasswordById(
  id: string,
  payload: { current_password: string; new_password: string }
) {
  return await axios
    .put(`${apiUrl}/users/${id}/update-password`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(), // ส่ง Authorization Header ในคำขอ
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
        Authorization: getAuthHeader(), // ส่ง Authorization Header ในคำขอ
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

//Pond
async function GetCourses() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = await fetch(`${apiUrl}/courses`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      throw new Error("Response is not in JSON format");
    }
  });

  return res;
}

async function CreateCourse(data: CourseInterface) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  const res = await fetch(`${apiUrl}/courses`, requestOptions).then((res) => {
    if (res.status == 201) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

async function UpdateCourse(data: CourseInterface) {
  const requestOptions = {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  const res = await fetch(`${apiUrl}/courses`, requestOptions).then((res) => {
    if (res.status == 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

async function GetCourseById(id: number) {
  const requestOptions = {
    method: "GET",
  };

  const res = await fetch(`${apiUrl}/courses/${id}`, requestOptions).then(
    (res) => {
      if (res.status == 200) {
        return res.json();
      } else {
        return false;
      }
    }
  );

  return res;
}

async function GetCourseByCategoryID(categoryID: number) {
  try {
    const response = await fetch(`/courses/category/${categoryID}`);
    if (!response.ok) throw new Error("การตอบสนองของเครือข่ายไม่ถูกต้อง");

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      throw new Error("การตอบสนองไม่ใช่ JSON");
    }
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงข้อมูลคอร์ส:", error);
    return false;
  }
}

async function GetCourseByTutorID(tutorID: number) {
  try {
    const response = await fetch(`${apiUrl}/tutor/${tutorID}`);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      if (Array.isArray(data)) {
        return data;
      } else {
        throw new Error("Received data is not an array");
      }
    } else {
      throw new Error("Response is not JSON");
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
    return []; // คืนค่าที่เป็น Array แทน `false`
  }
}

async function DeleteCourse(id: number) {
  try {
    const response = await fetch(`${apiUrl}/courses/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Course deleted successfully");
    } else {
      console.error("Failed to delete course");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Export ฟังก์ชันทั้งหมด
export {
  //User eye
  SignIn,
  GetUsers,
  GetUserById,
  UpdateUserById,
  DeleteUserById,
  CreateUser,
  UpdatePasswordById,
  loginService,
  GetTutorProfileById,
  //Course Pond
  GetCourses,
  CreateCourse,
  UpdateCourse,
  GetCourseById,
  GetCourseByCategoryID,
  GetCourseByTutorID,
  DeleteCourse,
};
