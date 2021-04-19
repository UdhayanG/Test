package handler

import (
	"RMS-Trail/domain/model"
	"RMS-Trail/domain/form"
	"net/http"

	"github.com/jinzhu/gorm"

	"github.com/labstack/echo"
	
	"encoding/json"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	
	//"strconv"
)

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

func Register(db *gorm.DB) echo.HandlerFunc{
	return func (c echo.Context) error {
		//u := new(form.Registration)
		var u form.Registration
		if err :=c.Bind(&u); err !=nil{
			return err 
		}

		if err := c.Validate(&u); err != nil {

			fmt.Println(err)
			return c.JSON(http.StatusUnauthorized,err.Error())
		}


		var login model.Logins
		duplicateUserCheck := db.Where("UserName = ? ",u.PhoneNumber).Find(&login)

		if(duplicateUserCheck.RowsAffected>=1){
			return c.JSON(http.StatusCreated, "User Name already exists")
		}
		fmt.Println(duplicateUserCheck.RowsAffected)
		var loginTypes model.LoginTypes
		var phoneNoTypes model.PhoneNoTypes
		var countries model.Countries
			lt := db.Select("LoginTypeID").Where("LoginTypeDesc = ?", "Phone").First(&loginTypes)
			pt := db.Select("PhoneNoTypeID").Where("PhoneNoTypeDesc = ?", "Mobile").First(&phoneNoTypes)
			country := db.Select("CountryID").Where("CountryName = ?", "INDIA").First(&countries)
			ltv ,err:= json.Marshal(lt.Value)
			ptv ,err:= json.Marshal(pt.Value)
			cv ,err:= json.Marshal(country.Value)
			if err == nil {	
				json.Unmarshal([]byte(ltv), &loginTypes)
				json.Unmarshal([]byte(ptv), &phoneNoTypes)
				json.Unmarshal([]byte(cv), &countries)
				//loginTypeId := strconv.Itoa(loginTypes.LoginTypeID)
				//phoneTypeId := strconv.Itoa(phoneNoTypes.PhoneNoTypeID)
				//countryId := strconv.Itoa(countries.CountryID)
				phoneInsert := model.PhoneNumbers{CountryID:countries.CountryID,
					PhoneNumber:u.PhoneNumber,
					NumberinInterForm:0,
					PhoneNoTypeID:phoneNoTypes.PhoneNoTypeID}

				phoneObject := db.Save(&phoneInsert)
				phoneValue, err := json.Marshal(phoneObject.Value)
				var phoneModel model.PhoneNumbers
				if err == nil {	

					json.Unmarshal([]byte(phoneValue), &phoneModel)

				}
				userInsert := model.User{
					FirstName:u.FirstName,
					MiddleName:u.MiddleName,
					LastName:u.LastName,
					DefaultAddressID:1,
					DefaultPhoneID:phoneModel.PhoneNoID}
				
				userObject :=	db.Save(&userInsert)
				userValue, err := json.Marshal(userObject.Value)
				var userModel model.User
				if err == nil {	
					json.Unmarshal([]byte(userValue), &userModel)
				}
				phoneUserInsert := model.UserPhoneNumbers{
					UserID:userModel.UserID,
					PhoneNoID:phoneModel.PhoneNoID}
				db.Save(&phoneUserInsert)
				//fmt.Println(loginTypeId)
				//fmt.Println(phoneTypeId)
				//fmt.Println(countryId)
				hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.MinCost)
    			if err != nil {
					fmt.Println(err)
   				}

				loginInsert := model.Logins{
					UserName:u.PhoneNumber,
					LoginTypeID:loginTypes.LoginTypeID,
					UserNameVerified:0,
					//LoginPassword:u.Password,
					LoginPasswordSalt:string(hash)}

					loginObject := db.Save(&loginInsert)
					loginValue, err := json.Marshal(loginObject.Value)
					var loginModel model.Logins
					if err == nil {	
						json.Unmarshal([]byte(loginValue), &loginModel)
					}
					loginUserInsert := model.UserLogins{
						UserID:userModel.UserID,
						LoginID:loginModel.LoginID}
					db.Save(&loginUserInsert)
					return c.JSON(http.StatusCreated, "Registered Successfully")
 			}
					
			//str := strconv.Itoa(addr.AddressID)
			//fmt.Println(str)
		//	s := model.PhoneNoTypes{PhoneNoTypeDesc:str}
			//db.Save(&s)
			
		 
		return c.JSON(http.StatusCreated, "result")
	}
}
