package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Parichatx/user-system2/config"
	//"github.com/Parichatx/user-system2/middlewares"
	"github.com/Parichatx/user-system2/controller/users"
	"github.com/Parichatx/user-system2/controller/tutor_profiles"
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

	// เส้นทางตรวจสอบสถานะ API
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	// เส้นทางสำหรับการสมัครสมาชิกและล็อกอิน
	authRoutes := r.Group("/auth")
	{
		authRoutes.POST("/signup", users.SignUp)
		authRoutes.POST("/signin", users.SignIn)
	}

	// กลุ่มเส้นทางที่ต้องการการยืนยันตัวตน
	userRoutes := r.Group("/users")
	{
		//userRoutes.Use(middlewares.Authorizes()) // ใช้ Middleware ตรวจสอบ Authorization
		userRoutes.PUT("/:id", users.Update)
		userRoutes.GET("/", users.GetAll)
		userRoutes.GET("/:id", users.Get)
		userRoutes.DELETE("/:id", users.Delete)
	}

	// เส้นทางสำหรับ tutor profiles
	tutorProfileRoutes := r.Group("/tutor_profiles")
	{
		tutorProfileRoutes.GET("/:id", tutor_profiles.GetTutorProfile)
		tutorProfileRoutes.GET("/users/:UserID", tutor_profiles.GetTutorProfileByUserID)
		tutorProfileRoutes.POST("/", tutor_profiles.CreateTutorProfile)
		tutorProfileRoutes.PATCH("/:id", tutor_profiles.UpdateTutorProfile)
		tutorProfileRoutes.DELETE("/:id", tutor_profiles.DeleteTutorProfile)
	}

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
