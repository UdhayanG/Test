package main

import (
	//"RMS-Trail/datastore"
	"RMS-Trail/handler"
	"log"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gopkg.in/go-playground/validator.v9"
	"RMS-Trail/utils"
	"gorm.io/gorm"
   "gorm.io/driver/mysql"
  // "github.com/onrik/gorm-logrus"
   "gorm.io/gorm/logger"
   "github.com/gorilla/sessions"
   "github.com/labstack/echo-contrib/session"
   "net/http"
   "fmt"
   "encoding/gob"
  // "RMS-Trail/domain/form"
  "encoding/json"
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
	gob.Register(map[string]interface{}{})
	e := echo.New()
	e.Validator = &utils.CustomValidator{Validator: validator.New()}
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())
	e.Use(session.Middleware(sessions.NewCookieStore([]byte("secret"))))


	e.GET("/createsession", func(c echo.Context) error {
		sess, _ := session.Get("session", c)
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   86400 * 7,
			HttpOnly: true,
			Secure : false,
		}
		sess.Values["foo"] = "bar"
		sess.Save(c.Request(), c.Response())
		//fmt.Println(sess.Values["foo"])
		return c.JSON(http.StatusOK, "session created")
		})

	e.POST("/reg", func(c echo.Context) error {		
		json_map := make(map[string]interface{})
		err := json.NewDecoder(c.Request().Body).Decode(&json_map)
		if err != nil {
			return err
		} 
		sess, _ := session.Get("session", c)
		sess.Options = &sessions.Options{
			Path:     "/",
			MaxAge:   86400 * 7,
			HttpOnly: true,
			Secure : false,
		}
		sess.Values["foo"] = "bar"
		sess.Values["Userdetails"] = json_map
		err = sess.Save(c.Request(), c.Response())
		if err != nil {
			return err
		}
		fmt.Println(sess.Values["foo"])
		return c.JSON(http.StatusOK, sess.Values["Userdetails"])
	
	})

	/*e.GET("/", func(c echo.Context) error {
	sess, _ := session.Get("session", c)
	sess.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		HttpOnly: true,
		Secure : false,
	}
	sess.Values["foo"] = "bar"
	//sess.Values["Userdetails"] = json_map
	//sess.Options.MaxAge = -1
	sess.Save(c.Request(), c.Response())
	fmt.Println(sess.Values["bar"])
	//return c.NoContent(http.StatusOK)
	return c.Redirect(http.StatusSeeOther, "/whoami")

	})*/

	/*e.GET("/getsessval", func(c echo.Context) error {

        sess, err := session.Get("session", c)
	
        if err != nil {
            return err
        }
		fmt.Println(sess.Values["foo"])
		fmt.Println(sess.Values["Userdetails"])
		return c.JSON(http.StatusOK, sess.Values["Userdetails"])
		
    })*/

	e.GET("/killsess", func(c echo.Context) error {		
        sess, err := session.Get("session", c)
	    if err != nil {
            return err
        }
		sess.Options.MaxAge = -1
		err = sess.Save(c.Request(), c.Response())
		if err != nil {
			return err
		}
		return c.JSON(http.StatusOK,"session destroyed")
		
    })

	/*e.Use(session.Middleware(sessions.NewCookieStore([]byte("secret"))))
	e.POST("/register", func(c echo.Context) error {
	//	ctx := c.Request().Body
		//fmt.Println(ctx)
		json_map := make(map[string]interface{})
		err := json.NewDecoder(c.Request().Body).Decode(&json_map)
		if err != nil {
			return err
		} //json_map has the JSON Payload decoded into a map
			
		sess, _ := session.Get("session", c)
		sess.Options = &sessions.Options{
		  Path:     "/",
		  MaxAge:   86400 * 7,
		  HttpOnly: true,
		}
		//fmt.Println(sess)
		//sess.Set("regDetails",form.Registration)
		//sess.Values["Userdetails"] = json_map
		//fmt.Println(sess.Values["Userdetails"])
		sess.Save(c.Request(), c.Response())
		fmt.Println(&sess.ID)
		return c.NoContent(http.StatusOK)
	  })*/
	
	//e.GET("/", handler.Welcome()) 
	e.GET("/users", handler.GetUsers(db)) 
	e.POST("/check", handler.Check(db))
	e.POST("/register", handler.Register(db)) 
	//e.GET("/getsessval",handler.GetSessVal())
	//e.POST("/register", handler.Register(db)) 
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
