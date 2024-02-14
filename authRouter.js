const Router = require('express');
const router = new Router();
const controller = require('./authController')
const {check} = require('express-validator');

router.post('/signup', [
    check('userFirstName', "The field userFirstName cannot be empty.").notEmpty(),
    check('userLastName', "The field userLastName cannot be empty.").notEmpty(),
    check('email', "The field Email cannot be empty.").notEmpty(),
    check('email', "Invalid format for email address.").isEmail(),
    check('password', "The password cannot be empty.").notEmpty(),
    // check('password', "The password must have a least 8 symbols").isLength({min: 8, max: 30})
], controller.signup)
router.post('/login', [
    check('email', "The field Email cannot be empty.").notEmpty(),
    check('email', "Invalid format for email address.").isEmail(),
    check('password', "The password cannot be empty.").notEmpty(),
    // check('password', "The password must have a least 8 symbols").isLength({min: 4, max: 30})
], controller.login);
router.post('/update', controller.changeUserStatus);
router.get('/users', controller.getUsers);
router.delete('/delete', controller.deleteUser);
router.post("/logout", controller.logout);

module.exports = router;