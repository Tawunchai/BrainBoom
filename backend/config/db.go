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


func SetupDatabase() {

	db.AutoMigrate(
		&entity.Users{},
		&entity.Genders{},
		&entity.UserRoles{},
		&entity.TutorProfiles{},
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

}