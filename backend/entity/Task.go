
package entity

import (
	
	"gorm.io/gorm"
)

type Tasks struct {
	gorm.Model
    Title  string

	UserID *uint
	User   Users  `gorm:"foreignKey:UserID"`
	
}