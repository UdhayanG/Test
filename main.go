package main

import (
	//"RMS-Trail/datastore"
	"RMS-Trail/handler"
	"log"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"gopkg.in/go-playground/validator.v9"
	"RMS-Trail/utils"
	"gorm.io/gorm"
   "gorm.io/driver/mysql"
  // "github.com/onrik/gorm-logrus"
   "gorm.io/gorm/logger"
)
func main() {
	dsn := "root:root@tcp(127.0.0.1:3306)/rms-golang?charset=utf8mb4&parseTime=True&loc=Local"
  db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{ Logger: logger.Default.LogMode(logger.Error), })
  if err != nil {
    panic("failed to connect database")
  }
	//db, err := datastore.NewDB()
	//logFatal(err)

	//db.LogMode(true)
	//db.Logger.LogMode(logger.Info)
	//defer db.Close()
	
	e := echo.New()
	e.Validator = &utils.CustomValidator{Validator: validator.New()}
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.GET("/", handler.Welcome()) 
	e.GET("/users", handler.GetUsers(db)) 
	e.POST("/check", handler.Check(db))
	//e.POST("/register", handler.Register(db)) 
	e.POST("/register", handler.Register(db)) 
	//e.POST("/address", handler.Address(db)) 
	// graphql
    /*	h, err := graphql.NewHandler(db)
	logFatal(err)
	e.POST("/graphql", echo.WrapHandler(h))*/
	err = e.Start(":3000")
	logFatal(err)
}

func logFatal(err error) {
	if err != nil {
		log.Fatalln(err)
	}
}
