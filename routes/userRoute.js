const { Router } = require("express");
const router = Router();
const userController = require("../controllers/userController");

router.post("/register", userController.signUp);
router.post("/signIn", userController.signIn);
router.get("/getAllUsers", userController.getAllUsers);
router.get("/getUser/:id", userController.getUser);
router.put("/updateUser/:id", userController.updateUser);
router.delete("/deleteUser/:id", userController.deleteUser);
module.exports = router;
