package payment

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/Parichatx/user-system2/config"
	"github.com/Parichatx/user-system2/entity"
)

func GetPaymentByIdUser(c *gin.Context) {
	userID := c.Param("userID")

	var payments []entity.Payments
	db := config.DB()

	if err := db.Preload("User").Preload("Course").Where("user_id = ?", userID).Find(&payments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(payments) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "ไม่พบการชำระเงินสำหรับผู้ใช้ที่ระบุ"})
		return
	}

	c.JSON(http.StatusOK, payments)
}

