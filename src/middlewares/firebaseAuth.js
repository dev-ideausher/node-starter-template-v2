const admin = require("firebase-admin");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const serviceAccount = require("../../firebase-service-secret.json");
const { userService, authService } = require("../services");


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const firebaseAuth = () => async (req, res, next) => {
    return new Promise( async (resolve, reject) => {
        const token = req.headers.authorization.split(" ")[1]
        // token not found
        if(!token) { reject(new ApiError(httpStatus.BAD_REQUEST, "Please Authenticate!")); }
        try {
            const payload = await admin.auth().verifyIdToken(token, true);
            const user = await authService.getUserByFirebaseUId(payload.uid);
            if(!user) {
                if(req.path === "/register") {
                    req.newUser = payload;
                } else reject(new ApiError(httpStatus.NOT_FOUND, "User doesn't exist. Please create account"));
            } else {
                if(user.isBlocked) { throw new ApiError(httpStatus.FORBIDDEN, "User is blocked"); }
                if(user.isDeleted) { throw new ApiError(httpStatus.GONE, "User doesn't exist anymore"); }
                req.user = user;
            }
            
            resolve(); 
        } catch(err) {
            console.log("FirebaseAuthError:", err);
            reject(new ApiError(httpStatus.UNAUTHORIZED, "Failed to authenticate"))
        }
    }).then(() => next()).catch((err) => next(err));
}


module.exports = firebaseAuth