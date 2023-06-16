const { authService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const loginUser = catchAsync(async (req, res) => {
    res.status(200).send({ data: req.user });
});

const registerUser = catchAsync(async (req,res) => {
    if(req.user) {
        res.status(401).send({ message: "User already exist"});
    } else {
        if(req.newUser.firebase.sign_in_provider === "phone") {
            userObj = { phone: req.newUser.phone_number, ...req.body }
        } else {
            userObj = {
                name: req.newUser.name,
                email: req.newUser.email,
                profilePic: req.newUser.picture,
                ...req.body
            }    
        }
        userObj = { 
            ...userObj,
            firebaseUid: req.newUser.uid,
            firebaseSignInProvider: req.newUser.firebase.sign_in_provider
        }
        const user = await authService.createUser(userObj);
        res.status(201).send({ data: user });
    }
});

module.exports = {
    loginUser,
    registerUser
}