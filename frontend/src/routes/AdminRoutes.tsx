import { lazy } from "react";
import { RouteObject } from "react-router-dom";
import Loadable from "../components/third-patry/Loadable";
import MinimalLayout from "../layout/MinimalLayout";

// Use Loadable to reduce bundle size
const MainPages = Loadable(lazy(() => import("../pages/authentication/Login")));
const ProfileUser = Loadable(lazy(() => import("../pages/User")));
const EditUser = Loadable(lazy(() => import("../pages/User/edit")));
const ChangePassword = Loadable(lazy(() => import("../pages/User/changepassword")));
const TutorProfile = Loadable(lazy(() => import("../pages/TutorProfile")));
const EditTutor = Loadable(lazy(() => import("../pages/TutorProfile/edit")));
const MyProfile = Loadable(lazy(() => import("../pages/TutorProfile/myprofile")));

//Course
const MainCourse = Loadable(lazy(() => import("../pages/Pond/Course/index")));
const CourseDetails = Loadable(lazy(() => import("../pages/Pond/CourseDetail/index")));
const MyCourses = Loadable(lazy(() => import("../pages/Pond/MyCourse/index")));
const TutorCourse = Loadable(lazy(() => import("../pages/Pond/Tutor/index")));
const SearchCourse = Loadable(lazy(() => import("../pages/Pond/Search/index")));

const AdminRoutes = (isLoggedIn: boolean): RouteObject => {
  const userRoleId = parseInt(localStorage.getItem("user_role_id") || "0", 10);
  const id = localStorage.getItem('id') || 'Unknown User';

  return {
    path: "/",
    element: <MinimalLayout />, // ใช้ MinimalLayout เป็น Wrapper
    children: [
      {
        path: "/",
        element: isLoggedIn ? (userRoleId === 2 ? <MainCourse /> : <MainCourse />) : <MainPages />,
      },
      {
        path: "myCourses", 
        element: isLoggedIn ? <MyCourses /> : <MainPages />,
      },
      {
        path: "tutor", 
        element: isLoggedIn ? <TutorCourse /> : <MainPages />,
      },
      {
        path: "search", 
        element: isLoggedIn ? <SearchCourse /> : <MainPages />,
      },
      {
        path: "course", 
        element: isLoggedIn ? <MainCourse /> : <MainPages />,
      },
      {
        path: "course/:id", // เส้นทางสำหรับ CourseDetail
        element: isLoggedIn ? <CourseDetails /> : <MainPages />,
      },
      {
        path: "users", 
        element: isLoggedIn ? (userRoleId === 2 ? <TutorProfile /> : <ProfileUser />) : <MainPages />,
        children: [
          {
            path: "edit/:id", 
            element: isLoggedIn ? <EditUser /> : <MainPages />,
          },
          {
            path: "changepassword/:id", 
            element: isLoggedIn ? <ChangePassword /> : <MainPages />,
          },
        ],
      },
      {
        path: "tutor_profiles/users/:userID",
        element: isLoggedIn ? <MyProfile /> : <MainPages />,
      },
      {
        path: "tutor_profiles/edit/:userID",
        element: isLoggedIn ? <EditTutor /> : <MainPages />,
      }
    ],
  };
};

export default AdminRoutes;
