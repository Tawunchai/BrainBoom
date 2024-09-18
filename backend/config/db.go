package config


import (

   "fmt"

   "time"

   "github.com/Parichatx/user-system2/entity"

   "gorm.io/driver/sqlite"

   "gorm.io/gorm"

)


var db *gorm.DB


func DB() *gorm.DB {

   return db

}


func ConnectionDB() {

   database, err := gorm.Open(sqlite.Open("sa.db?cache=shared"), &gorm.Config{})

   if err != nil {

       panic("failed to connect database")

   }

   fmt.Println("connected database")

   db = database

}


func SetupDatabase() error {

	db.AutoMigrate(
		&entity.Users{},
		&entity.Genders{},
		&entity.UserRoles{},
		&entity.TutorProfiles{},
		&entity.Courses{}, // edit
		&entity.CourseCategories{}, // edit
		&entity.Reviews{}, // edit
	)

	GenderMale := entity.Genders{Gender: "Male"}
	GenderFemale := entity.Genders{Gender: "Female"}

	db.FirstOrCreate(&GenderMale, &entity.Genders{Gender: "Male"})
	db.FirstOrCreate(&GenderFemale, &entity.Genders{Gender: "Female"})

	AdminRole := entity.UserRoles{RoleName: "Admin"}
	TutorRole := entity.UserRoles{RoleName: "Tutor"}
	StudentRole := entity.UserRoles{RoleName: "Student"}

	db.FirstOrCreate(&AdminRole, &entity.UserRoles{RoleName: "Admin"})
	db.FirstOrCreate(&TutorRole, &entity.UserRoles{RoleName: "Tutor"})
	db.FirstOrCreate(&StudentRole, &entity.UserRoles{RoleName: "Student"})

	hashedPassword, _ := HashPassword("123456")
	BirthDay, _ := time.Parse("2006-01-02", "1988-11-12")

	User := &entity.Users{
		Username:  "Parichat",
		Password:  hashedPassword,
		Email:     "sa@gmail.com",
		FirstName: "Software",
		LastName:  "Analysis",
		Birthday:  BirthDay,
		Profile:   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
		UserRoleID: 3,
		GenderID:  1,
		
	}

	db.FirstOrCreate(User, &entity.Users{
		Username: "Parichat",
	})

	hashedPassword2, _ := HashPassword("123456")
	BirthDay2, _ := time.Parse("2006-01-02", "1988-11-12")

	TutorUser := &entity.Users{
		Username:   "johndoe",
		Password:   hashedPassword2,
		Email:      "johndoe@example.com",
		FirstName:  "John",
		LastName:   "Doe",
		Birthday:   BirthDay2,
		Profile:    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAsSAAALEgHS3X78AAAADUlEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
		UserRoleID: 2,
		GenderID:   1,
		
	}

	db.FirstOrCreate(TutorUser, &entity.Users{Username: "johndoe"})

	// Create TutorProfile for the user
	TutorProfile := &entity.TutorProfiles{
		UserID:         &TutorUser.ID,
		Bio:            "Experienced software engineer with a passion for teaching.",
		Experience:    "5 years as a senior software developer at XYZ Corp.",
		Education:      "M.Sc. in Computer Science",

	}

	db.FirstOrCreate(TutorProfile, &entity.TutorProfiles{UserID: &TutorUser.ID})

	// Seed a default Course Category
	var courseCategory entity.CourseCategories
	if err := db.Where("category_name = ?", "แนะนำสำหรับคุณ").First(&courseCategory).Error; err != nil {
		courseCategory = entity.CourseCategories{CategoryName: "แนะนำสำหรับคุณ"}
		if err := db.Create(&courseCategory).Error; err != nil {
			return fmt.Errorf("failed to create CourseCategory: %w", err)
		}
	}

	// Seed a default Tutor Profile
	tutorProfile := &entity.TutorProfiles{
		UserID: func(v uint) *uint { return &v }(User.ID), // Convert uint to *uint
		Bio:    "Experienced software engineer with expertise in multiple programming languages.",
	}
	if err := db.FirstOrCreate(tutorProfile, &entity.TutorProfiles{UserID: tutorProfile.UserID}).Error; err != nil {
		return fmt.Errorf("failed to create or find tutor profile: %w", err)
	}

	// Seed default Courses
	for i := 1; i <= 10; i++ {
		course := &entity.Courses{
			Title:            fmt.Sprintf("Course %d", i),
			ProfilePicture:   []byte{},
			Price:            float32(1999 + i*100),
			TeachingPlatform: "Online",
			Description:      fmt.Sprintf("This course provides comprehensive content on various topics. Course number %d.", i),
			Duration:         uint(40 + i), 
			TutorProfileID:   tutorProfile.UserID,
			CourseCategoryID: &courseCategory.ID,
		}
	
		if err := db.FirstOrCreate(course, &entity.Courses{Title: course.Title}).Error; err != nil {
			return fmt.Errorf("failed to create or find course %d: %w", i, err)
		}
	}

	return nil

}