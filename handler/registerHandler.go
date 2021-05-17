package handler

import (
	"RMS-Trail/config"
	"RMS-Trail/domain/form"
	"RMS-Trail/domain/model"
	"crypto/tls"
	"encoding/gob"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/sessions"
	"github.com/ilyakaznacheev/cleanenv"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	gomail "gopkg.in/mail.v2"
)

var (
	cfg config.Properties
)

func init() {

	if err := cleanenv.ReadEnv(&cfg); err != nil {
		log.Fatalf("Cannot Read Config : %v", err)
	}
}

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

// CreateRMS godoc
// @Summary Create a RMS
// @Description Create a new todo item
// @Tags RMS
// @Accept json
// @Produce json
// @Param RMS body form.Registration true "New User"
// @Success 201 {object} form.Registration
// @Router /register [post]
func Register(tx *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		gob.Register(map[string]interface{}{})
		var u form.Registration
		if err := c.Bind(&u); err != nil {
			return c.JSON(http.StatusUnauthorized, err.Error())
		}

		sess, _ := session.Get("session", c)
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   86400 * 7,
			HttpOnly: true,
			Secure:   false,
		}
		fmt.Println(sess.Values["Userdetails"])
		u.Err = "Registration failed"
		sess.Values["Userdetails"] = u
		sess.Save(c.Request(), c.Response())

		tx.Transaction(func(db *gorm.DB) error {
			if err := c.Validate(&u); err != nil {
				u.Err = err.Error()
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusUnauthorized, sess.Values["Userdetails"])
			}
			if strings.Compare(u.Password, u.ConfirmPassword) != 0 {
				u.Err = "Password Mismatch, Please enter correctly"
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusUnauthorized, sess.Values["Userdetails"])
			}
			var login model.Logins
			duplicateUserCheck := db.Debug().Where("UserName = ? ", u.PhoneNumber).Find(&login)
			if duplicateUserCheck.RowsAffected >= 1 {
				u.Err = "User Name already exists"
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusCreated, sess.Values["Userdetails"])
			}
			var loginTypes model.LoginTypes
			var phoneNoTypes model.PhoneNoTypes
			var countries model.Countries
			db.Select("LoginTypeID").Where("LoginTypeDesc = ?", "Phone").First(&loginTypes)
			db.Select("PhoneNoTypeID").Where("PhoneNoTypeDesc = ?", "Mobile").First(&phoneNoTypes)
			db.Select("CountryID").Where("CountryName = ?", "INDIA").First(&countries)
			phoneInsert := model.PhoneNumbers{CountryID: countries.CountryID, PhoneNumber: u.PhoneNumber, PhoneNoTypeID: phoneNoTypes.PhoneNoTypeID}
			if err := db.Debug().Save(&phoneInsert).Error; err != nil {
				//fmt.Println(err)
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusCreated, sess.Values["Userdetails"])
			}
			fmt.Println(phoneInsert.PhoneNoID)
			userInsert := model.User{FirstName: u.FirstName, MiddleName: u.MiddleName, LastName: u.LastName, DefaultAddressID: 1, DefaultPhoneID: phoneInsert.PhoneNoID}
			if err := db.Debug().Save(&userInsert).Error; err != nil {
				//fmt.Println(err)
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusInternalServerError, sess.Values["Userdetails"])
			}
			phoneUserInsert := model.UserPhoneNumbers{UserID: userInsert.UserID, PhoneNoID: phoneInsert.PhoneNoID}
			if err := db.Debug().Save(&phoneUserInsert).Error; err != nil {
				//fmt.Println(err)
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusInternalServerError, sess.Values["Userdetails"])
			}
			hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.MinCost)
			if err != nil {
				//fmt.Println(err)
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusInternalServerError, sess.Values["Userdetails"])
			}
			loginInsert := model.Logins{UserName: u.PhoneNumber, LoginTypeID: loginTypes.LoginTypeID, UserNameVerified: 0, LoginPasswordSalt: string(hash)}
			if err := db.Debug().Save(&loginInsert).Error; err != nil {
				//fmt.Println(err)
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusInternalServerError, sess.Values["Userdetails"])
			}
			loginUserInsert := model.UserLogins{UserID: userInsert.UserID, LoginID: loginInsert.LoginID}
			if err := db.Debug().Save(&loginUserInsert).Error; err != nil {
				//fmt.Println(err)
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusInternalServerError, sess.Values["Userdetails"])
			}
			return c.JSON(http.StatusCreated, "Registered Successfully")

		})
		/*sess.Options.MaxAge = -1
		err = sess.Save(c.Request(), c.Response())
		if err != nil {
			return err
		}
		fmt.Println(sess.Values["Userdetails"])
		return c.JSON(http.StatusCreated,"Registered Successfully")*/

		return nil
	}
	//return err
}

func RegisterWithEmail(tx *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		fmt.Println(c.Request().RequestURI)
		fmt.Println(c.Request().Body)
		fmt.Println(c.Request().Host)
		fmt.Println(c.Request().URL)

		gob.Register(map[string]interface{}{})
		var u form.Registration
		if err := c.Bind(&u); err != nil {
			return c.JSON(http.StatusUnauthorized, err.Error())
		}

		sess, _ := session.Get("session", c)
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   86400 * 7,
			HttpOnly: true,
			Secure:   false,
		}
		fmt.Println(sess.Values["Userdetails"])
		u.Err = "Registration failed"
		sess.Values["Userdetails"] = u
		sess.Save(c.Request(), c.Response())

		tx.Transaction(func(db *gorm.DB) error {
			if err := c.Validate(&u); err != nil {
				u.Err = err.Error()
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusUnauthorized, sess.Values["Userdetails"])
			}
			if strings.Compare(u.Password, u.ConfirmPassword) != 0 {
				u.Err = "Password Mismatch, Please enter correctly"
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusUnauthorized, sess.Values["Userdetails"])
			}
			var login model.Logins
			duplicateUserCheck := db.Debug().Where("UserName = ? ", u.EmailAddress).Find(&login)
			if duplicateUserCheck.RowsAffected >= 1 {
				u.Err = "User Name already exists"
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusCreated, sess.Values["Userdetails"])
			}
			var loginTypes model.LoginTypes
			//var phoneNoTypes model.PhoneNoTypes
			var countries model.Countries
			db.Select("LoginTypeID").Where("LoginTypeDesc = ?", "Phone").First(&loginTypes)
			//	db.Select("PhoneNoTypeID").Where("PhoneNoTypeDesc = ?", "Mobile").First(&phoneNoTypes)
			db.Select("CountryID").Where("CountryName = ?", "INDIA").First(&countries)
			emailInsert := model.Emails{EmailAddress: u.EmailAddress}
			if err := db.Debug().Save(&emailInsert).Error; err != nil {
				//fmt.Println(err)
				db.Rollback()
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusCreated, sess.Values["Userdetails"])
			}
			fmt.Println(emailInsert.EmailID)
			userInsert := model.User{FirstName: u.FirstName, MiddleName: u.MiddleName, LastName: u.LastName, DefaultAddressID: 1, DefaultPhoneID: 2}
			if err := db.Debug().Save(&userInsert).Error; err != nil {
				//fmt.Println(err)
				db.Rollback()
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusInternalServerError, sess.Values["Userdetails"])
			}
			emailUserInsert := model.UserEmails{UserID: userInsert.UserID, EmailID: emailInsert.EmailID}
			if err := db.Debug().Save(&emailUserInsert).Error; err != nil {
				//fmt.Println(err)
				db.Rollback()
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusInternalServerError, sess.Values["Userdetails"])
			}
			hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.MinCost)
			if err != nil {
				//fmt.Println(err)
				db.Rollback()
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusInternalServerError, sess.Values["Userdetails"])
			}
			loginInsert := model.Logins{UserName: u.EmailAddress, LoginTypeID: loginTypes.LoginTypeID, UserNameVerified: 0, LoginPasswordSalt: string(hash)}
			if err := db.Debug().Save(&loginInsert).Error; err != nil {
				//fmt.Println(err)
				db.Rollback()
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusInternalServerError, sess.Values["Userdetails"])
			}
			loginUserInsert := model.UserLogins{UserID: userInsert.UserID, LoginID: loginInsert.LoginID}
			if err := db.Debug().Save(&loginUserInsert).Error; err != nil {
				//fmt.Println(err)
				db.Rollback()
				sess.Values["Userdetails"] = u
				sess.Save(c.Request(), c.Response())
				return c.JSON(http.StatusInternalServerError, sess.Values["Userdetails"])
			}
			sendMail(u, c.Request().Host)
			return c.JSON(http.StatusCreated, "Registered Successfully")

		})
		/*sess.Options.MaxAge = -1
		err = sess.Save(c.Request(), c.Response())
		if err != nil {
			return err
		}
		fmt.Println(sess.Values["Userdetails"])
		return c.JSON(http.StatusCreated,"Registered Successfully")*/

		return nil
	}
	//return err
}

func sendMail(u form.Registration, ip string) error {

	m := gomail.NewMessage()

	mainUrl := "http://" + ip + "/account/verify-email?token="
	// Set E-Mail sender
	m.SetHeader("From", cfg.MailFromAddress)

	// Set E-Mail receivers
	m.SetHeader("To", u.EmailAddress)

	// Set E-Mail subject
	m.SetHeader("Subject", "RMS Registration")

	// Set E-Mail body. You can set plain text or html with text/html
	//m.SetBody("html/template", "<p><a href="+mainUrl+">"+mainUrl+"</a></p>")
	m.SetBody("text/html", fmt.Sprintf("<p>Please click the below link to verify your email address:</p> "+
		"<p><a href= %s>%s</a></p>", mainUrl, mainUrl))

	// Settings for SMTP server
	d := gomail.NewDialer(cfg.MailHost, cfg.MailPort, cfg.MailFromAddress, cfg.MailPassword)

	// This is only needed when SSL/TLS certificate is not valid on server.
	// In production this should be set to false.
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	// Now send E-Mail
	if err := d.DialAndSend(m); err != nil {
		fmt.Println(err)
		panic(err)
	}

	return nil

}

/*func Register(tx *gorm.DB) echo.HandlerFunc{
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
*/
