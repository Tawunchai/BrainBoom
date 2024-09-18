package entity

import ("gorm.io/gorm"  
		"time" )

type Reviews struct {
	gorm.Model
	Rating uint
	Comment string
	ReviewDate time.Time // edit by tawun 


	// UserId ทำหน้าที่เป็น FK
	UserID *uint
	User   Users  `gorm:"foreignKey:UserID"`

	// UserId ทำหน้าที่เป็น FK
	CourseID *uint
	Course   Courses  `gorm:"foreignKey:CourseID"`
}