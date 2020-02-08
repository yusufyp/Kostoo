const express = require("express");
const validator = require("validator");
const User = require("../core/user");
const user = new User();
const randomstring = require("randomstring");
const path = require("path");

const router = express.Router();

router.get("/", (req, res, next) => {
    console.log(req.session.user);
    if (req.session.user) {
        res.render("home", { user: req.session.user });
    } else {
        res.render("home", { user: null });
    }
});

router.get("/login", (req, res, next) => {
    if (req.session.user) {
        res.redirect("/dashboard");
    } else {
        res.render("login");
    }
});

router.get("/register", (req, res, next) => {
    if (req.session.user) {
        res.redirect("/dashboard");
    } else {
        res.render("register");
    }
});

router.post("/loginDesa", (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;

    if (validator.isEmail(email)) {
        user.login(email, password, "desa", (result) => {
            if (result) {
                req.session.user = result;
                req.session.type = "desa";
                res.redirect("/dashboard");
            } else {
                res.redirect("/login");
            }
        });
    } else {
        res.redirect("login");
    }
});

router.post("/loginInvestor", (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;

    if (validator.isEmail(email)) {
        user.login(email, password, "investor", (result) => {
            if (result) {
                req.session.user = result;
                req.session.type = "investor";
                res.redirect("/dashboard");
            } else {
                res.redirect("/login")
            }
        });
    } else {
        res.redirect("login");
    }
});

router.get("/dashboard", (req, res, next) => {
    if (req.session.user) {
        if (req.session.type === "desa") {
            res.render("dashboardDesa", { user: req.session.user });
        } else {
            res.render("dashboardInvestor", { user: req.session.user });
        }
    } else {
        res.redirect("login");
    }
});

router.post("/registerDesa", (req, res, next) => {
    let photo = req.files.photo;
    let portofolio = req.files.portofolio;
    if (photo.mimetype.split("/")[1] == "jpeg" && portofolio.mimetype.split("/")[1] == "pdf") {
        if (validator.isEmail(req.body.email)) {
            let category = "";
            if (req.body.cat1) {
                category = category + "Pertanian" + "-";
            }
            if (req.body.cat2) {
                category = category + "Peternakan" + "-";
            }
            if (req.body.cat3) {
                category = category + "Kerajinan";
            }
            let photoPath = randomstring.generate(84);
            let portofolioPath = randomstring.generate(84);

            photo.mv(path.join(__dirname, "../public/user-uploads/img/" + photoPath + ".jpg"), () => {
                portofolio.mv(path.join(__dirname, "../public/user-uploads/pdf/" + portofolioPath + ".pdf"), () => {
                    user.create(req.body.email, req.body.password, req.body.nama, req.body.location, photoPath + ".jpg", req.body.description, portofolioPath + ".pdf", category, "desa", (result) => {
                        if (result) {
                            user.find(req.body.email, "desa", (result) => {
                                req.session.user = result;
                                req.session.type = "desa";
                                res.redirect("/dashboard");
                            })
                        } else {
                            res.redirect("/register");
                        }
                    })
                });
            });
        } else {
            res.redirect("/register");
        }
    } else {
        res.redirect("/register");
    }
});

router.post("/registerInvestor", (req, res, next) => {
    if (validator.isEmail(req.body.email)) {
        user.create(req.body.email, req.body.password, "investor", (result) => {
            if (result) {
                req.session.user = result;
                req.session.type = "investor";
                res.redirect("/dashboard");
            } else {
                res.redirect("/register");
            }
        })
    } else {
        res.redirect("/register");
    }
});

router.post("/logout", (req, res, next) => {
    if (req.session.user) {
        req.session.destroy();
    } else {
        res.redirect("/");
    }
});

module.exports = router;