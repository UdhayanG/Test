package handler

import (
	"RMS-Trail/domain/model"
	"RMS-Trail/domain/form"
	"net/http"

	//"github.com/jinzhu/gorm"
	"gorm.io/gorm"
   //"gorm.io/driver/mysql"

	"github.com/labstack/echo"
	
	//"encoding/json"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"strings"
	
	

	//"github.com/go-playground/locales/en"
//	ut "github.com/go-playground/universal-translator"
//	"gopkg.in/go-playground/validator.v9"
//	en_translations "gopkg.in/go-playground/validator.v9/translations/en"
	
	
	//"strconv"
)
// use a single instance , it caches struct info
//var (
//	uni      *ut.UniversalTranslator
//	validate *validator.Validate
//)

/*func Register(db *gorm.DB) echo.HandlerFunc{
	return func (c echo.Context) error {
		u := new(*model.User)
		if err :=c.Bind(u); err !=nil{
			return err 
		}
	
		result := db.Create(&u)
		id := result.Scan(&u)
	return c.JSON(http.StatusCreated, id)
	}
}*/

func Register(tx *gorm.DB) echo.HandlerFunc{
	return func (c echo.Context) error {
		//To perform a set of Registration operations within a transaction
		tx.Transaction(func(db *gorm.DB) error {
			var u form.Registration
			if err :=c.Bind(&u); err !=nil{
				return c.JSON(http.StatusUnauthorized,err.Error())
			}
			if err := c.Validate(&u); err != nil {
				fmt.Println(err)
				return c.JSON(http.StatusUnauthorized,err.Error())
			}
			if strings.Compare(u.Password, u.ConfirmPassword)!=0{
				return c.JSON(http.StatusUnauthorized,"Password Mismatch, Please enter correctly")

			}
			var login model.Logins
			duplicateUserCheck := db.Debug().Where("UserName = ? ",u.PhoneNumber).Find(&login)
			if(duplicateUserCheck.RowsAffected>=1){
				return c.JSON(http.StatusCreated, "User Name already exists")
			}
			var loginTypes model.LoginTypes
			var phoneNoTypes model.PhoneNoTypes
			var countries model.Countries			
				db.Select("LoginTypeID").Where("LoginTypeDesc = ?", "Phone").First(&loginTypes)
				db.Select("PhoneNoTypeID").Where("PhoneNoTypeDesc = ?", "Mobile").First(&phoneNoTypes)
				db.Select("CountryID").Where("CountryName = ?", "INDIA").First(&countries)
				phoneInsert := model.PhoneNumbers{CountryID:countries.CountryID,PhoneNumber:u.PhoneNumber,PhoneNoTypeID:phoneNoTypes.PhoneNoTypeID}
				if err := db.Debug().Save(&phoneInsert).Error; err != nil {
					//fmt.Println(err)
					return c.JSON(http.StatusCreated, err)
				}
				fmt.Println(phoneInsert.PhoneNoID)
				userInsert := model.User{FirstName:u.FirstName,MiddleName:u.MiddleName,LastName:u.LastName,DefaultAddressID:1,DefaultPhoneID:phoneInsert.PhoneNoID}
				if err := db.Debug().Save(&userInsert).Error; err != nil {
					//fmt.Println(err)
					return c.JSON(http.StatusInternalServerError, "Registration failed")
				}
				phoneUserInsert := model.UserPhoneNumbers{UserID:userInsert.UserID,PhoneNoID:phoneInsert.PhoneNoID}
				if err := db.Debug().Save(&phoneUserInsert).Error; err != nil {
					//fmt.Println(err)
					return c.JSON(http.StatusInternalServerError, "Registration failed")
				}	
				hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.MinCost)
				if err != nil {
					//fmt.Println(err)
					return c.JSON(http.StatusInternalServerError, "Registration failed")
				}
				loginInsert := model.Logins{UserName:u.PhoneNumber,LoginTypeID:loginTypes.LoginTypeID,UserNameVerified:0,LoginPasswordSalt:string(hash)}
				if err := db.Debug().Save(&loginInsert).Error; err != nil {
					//fmt.Println(err)
					return c.JSON(http.StatusInternalServerError, "Registration failed")
				}	
				loginUserInsert := model.UserLogins{UserID:userInsert.UserID,LoginID:loginInsert.LoginID}
				if err := db.Debug().Save(&loginUserInsert).Error; err != nil {
					//fmt.Println(err)
					return c.JSON(http.StatusInternalServerError, "Registration failed")
				}
				return c.JSON(http.StatusCreated, "Registered Successfully")
		})
				return nil
	}
	//return err
}


