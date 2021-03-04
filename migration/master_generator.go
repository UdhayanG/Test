package migration

import (
	"github.com/ybkuroki/go-webapp-sample/model"
	"github.com/ybkuroki/go-webapp-sample/mycontext"
)

// InitMasterData creates the master data used in this application.
func InitMasterData(context mycontext.Context) {
	if context.GetConfig().Extension.MasterGenerator {
		rep := context.GetRepository()

		r := model.NewAuthority("Admin")
		_, _ = r.Create(rep)
		a := model.NewAccountWithPlainPassword("test", "test", r.ID)
		_, _ = a.Create(rep)

		c := model.NewCategory("Cat1")
		_, _ = c.Create(rep)
		c = model.NewCategory("Cat2")
		_, _ = c.Create(rep)
		c = model.NewCategory("Cat3")
		_, _ = c.Create(rep)

		f := model.NewFormat("Fmt1")
		_, _ = f.Create(rep)
		f = model.NewFormat("Fmt2")
		_, _ = f.Create(rep)
	}
}
