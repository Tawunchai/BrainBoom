package course

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Parichatx/user-system2/config"
	"github.com/Parichatx/user-system2/entity"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

var validate = validator.New()

// GET /courses - List all courses
func ListCourse(c *gin.Context) {
	var courses []entity.Courses

	db := config.DB()
	db.Find(&courses)

	c.JSON(http.StatusOK, courses)
}

// GET /courses/:id - Retrieve a single course by ID
func GetCourse(c *gin.Context) {
	var course entity.Courses
	id := c.Param("id")

	db := config.DB()
	if err := db.First(&course, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, course)
}

// POST /courses - Create a new course
func CreateCourse(c *gin.Context) {
	var course entity.Courses

	// Bind JSON input to the course object
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate input
	if err := validate.Struct(course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed"})
		return
	}

	db := config.DB()

	// Create a new course
	co := entity.Courses{
		Title:            course.Title,
		ProfilePicture:   course.ProfilePicture,
		Price:            course.Price,
		TeachingPlatform: course.TeachingPlatform,
		Description:      course.Description,
		Duration:         course.Duration,
	}

	// Save course to the database
	if err := db.Create(&co).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Course created successfully", "data": co})
}

// PUT /courses/:id - Update an existing course by ID
func UpdateCourse(c *gin.Context) {
	var course entity.Courses
	id := c.Param("id")

	db := config.DB()

	// Retrieve the existing course
	if err := db.First(&course, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Bind updated data to the existing course object
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate the updated data
	if err := validate.Struct(course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed"})
		return
	}

	// Save the updated course
	if err := db.Save(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course updated successfully", "data": course})
}

// DELETE /courses/:id - Delete a course
func DeleteCourse(c *gin.Context) {
	var course entity.Courses
	id := c.Param("id")

	db := config.DB()

	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&course, id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
				return err
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return err
		}

		if err := tx.Delete(&course).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
}

// GET /courses/category/:id - Retrieve courses by category ID
func GetCourseByCategoryID(c *gin.Context) {
    id := c.Param("id")
    var course []entity.Courses

    db := config.DB()
    results := db.Preload("CourseCategory").Where("course_category_id = ?", id).Find(&course)

    if results.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database query failed"})
        return
    }
    if len(course) == 0 {
        c.JSON(http.StatusNoContent, gin.H{})
        return
    }
    c.JSON(http.StatusOK, course)
}

// GET /courses/tutor/:id - Retrieve courses by tutor ID
func GetCourseByTutorID(c *gin.Context) {
    id := c.Param("id")
    var course []entity.Courses

    db := config.DB()
    results := db.Preload("TutorProfile").Where("tutor_profile_id = ?", id).Find(&course)

    if results.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database query failed"})
        return
    }
    if len(course) == 0 {
        c.JSON(http.StatusNoContent, gin.H{})
        return
    }
    c.JSON(http.StatusOK, course)
}
