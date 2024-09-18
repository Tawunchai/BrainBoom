package main

import (
	"net/http"

	"github.com/Parichatx/user-system2/config"
	"github.com/Parichatx/user-system2/controller/course"
	"github.com/Parichatx/user-system2/controller/tutor_profiles"
	"github.com/Parichatx/user-system2/controller/users"
	//"github.com/Parichatx/user-system2/middlewares"
	"github.com/gin-gonic/gin"
)

const PORT = "8000"

func main() {

	// เปิดการเชื่อมต่อฐานข้อมูล
	config.ConnectionDB()

	// สร้างฐานข้อมูล
	config.SetupDatabase()

	r := gin.Default()

	// เพิ่ม Middleware สำหรับ CORS
	r.Use(CORSMiddleware())

	router := r.Group("")
	{
		// User By Eye
		// เส้นทางสำหรับการสมัครสมาชิกและล็อกอิน
		r.POST("/signup", users.SignUp)
		r.POST("/signin", users.SignIn)
		// กลุ่มเส้นทางที่ต้องการการยืนยันตัวตน
		r.PUT("/users/:id", users.Update)
		r.GET("/users", users.GetAll)
		r.GET("/users/:id", users.Get)
		r.DELETE("/users/:id", users.Delete)
		r.GET("/tutor_profiles/:userID", tutor_profiles.GetTutorProfile) // edit by tawun

		// Course Routes By Pond
		router.GET("/courses", course.ListCourse)
		router.GET("/courses/:id", course.GetCourse)
		router.GET("/courses/category/:id", course.GetCourseByCategoryID)
		router.GET("/tutor/:id", course.GetCourseByCategoryID)
		router.POST("/courses", course.CreateCourse)
		router.PUT("/courses/:id", course.UpdateCourse)
		router.DELETE("/courses/:id", course.DeleteCourse)

		//Review By Tawun

	}

	// เส้นทางตรวจสอบสถานะ API
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	// เส้นทางสำหรับ tutor profiles
	// Route to get tutor profile by userID
	//r.GET("/:id", tutor_profiles.GetTutorProfile)
	//r.GET("/users/:id", tutor_profiles.GetTutorProfileByUserID)
	//r.POST("/tutor_profiles", tutor_profiles.CreateTutorProfile)
	//r.PATCH("/tutor_profiles/:id", tutor_profiles.UpdateTutorProfile)
	//r.DELETE("/tutor_profiles/:id", tutor_profiles.DeleteTutorProfile)

	// เริ่มรันเซิร์ฟเวอร์
	r.Run("localhost:" + PORT)
}

// ฟังก์ชัน Middleware สำหรับจัดการ CORS
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
