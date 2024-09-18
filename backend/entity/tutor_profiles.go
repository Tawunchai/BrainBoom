package entity

import (
	

	"gorm.io/gorm"
)

type TutorProfiles struct {
	gorm.Model
	Bio  string `json:"bio"`
	Experience  string `json:"experience"`
	Education     string `json:"education,omitempty"`

	// UserId ทำหน้าที่เป็น FK
	UserID *uint
	User   *Users `gorm:"foreignKey:UserID"`
	
}