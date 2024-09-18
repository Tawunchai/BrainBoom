package entity

import (
	

	"gorm.io/gorm"
)

type TutorProfiles struct { // edit
	gorm.Model
	Bio  string 
	Experience  string 
	Education     string 
	ProfilePicture []byte // edit

	// UserId ทำหน้าที่เป็น FK
	UserID *uint
	User   *Users `gorm:"foreignKey:UserID"`
	
}