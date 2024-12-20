import { body, validationResult } from "express-validator";

// Middleware Validator Function
const validator = () => {
  return [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),

    body("username")
      .isLength({ min: 6 })
      .withMessage("Username must be at least 6 characters long")
      .custom((value) => {
        if (value !== value.toLowerCase()) {
          throw new Error("Username must be in lowercase");
        }
        return true;
      }),
    body("contactNumber")
      .matches([/^\d{10,11}$/])
      .withMessage("Contact number must be 10 or 11 digits")
  ];
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  next();
};

export { validator, handleValidationErrors };
