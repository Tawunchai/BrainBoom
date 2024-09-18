package tutor_profiles

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/Parichatx/user-system2/config"
	"github.com/Parichatx/user-system2/entity"
)

// POST /tutor-profile
func CreateTutorProfile(c *gin.Context) {
	var tutorProfile entity.TutorProfiles

	if err := c.ShouldBindJSON(&tutorProfile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	var user entity.Users
	if err := db.First(&user, tutorProfile.UserID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	if err := db.Create(&tutorProfile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Tutor profile created", "data": tutorProfile})
}


func GetTutorProfileByUserID(c *gin.Context) {
    userID := c.Param("UserID")
    var tutorProfile entity.TutorProfiles

    db := config.DB()

    // ดึงข้อมูลโปรไฟล์ของ tutor โดยใช้ userID
    if err := db.Preload("User").Where("user_id = ?", userID).First(&tutorProfile).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Tutor profile not found"})
        return
    }
    c.JSON(http.StatusOK, tutorProfile) // ข้อมูล tutorProfile จะมีฟิลด์ experience, education, bio
}

// GET /tutor-profile/:id
func GetTutorProfile(c *gin.Context) {
	ID := c.Param("id")
	var tutorProfile entity.TutorProfiles

	db := config.DB()
	if err := db.Preload("User").First(&tutorProfile, ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tutor profile not found"})
		return
	}
	c.JSON(http.StatusOK, tutorProfile)
}

// GET /tutor-profiles
func ListTutorProfiles(c *gin.Context) {
	var tutorProfiles []entity.TutorProfiles

	db := config.DB()
	if err := db.Preload("User").Find(&tutorProfiles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tutorProfiles)
}

// PATCH /tutor-profile/:id
func UpdateTutorProfile(c *gin.Context) {
	var tutorProfile entity.TutorProfiles
	TutorProfileID := c.Param("id")

	db := config.DB()
	if err := db.First(&tutorProfile, TutorProfileID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tutor profile not found"})
		return
	}

	if err := c.ShouldBindJSON(&tutorProfile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	var user entity.Users
	if err := db.First(&user, tutorProfile.UserID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	if err := db.Save(&tutorProfile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated successfully", "data": tutorProfile})
}

// DELETE /tutor-profile/:id
func DeleteTutorProfile(c *gin.Context) {
	ID := c.Param("id")
	db := config.DB()
	if err := db.Delete(&entity.TutorProfiles{}, ID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tutor profile not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}
