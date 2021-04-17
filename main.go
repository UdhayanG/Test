package main

import (
	"RMS-Trail/datastore"
	"RMS-Trail/handler"
	"log"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/go-playground/validator/v10"

	"RMS-Trail/utils"
)
func main() {
	db, err := datastore.NewDB()
	logFatal(err)

	db.LogMode(true)
	defer db.Close()
	
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
