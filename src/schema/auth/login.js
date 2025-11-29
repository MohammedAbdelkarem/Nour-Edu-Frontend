import Joi from "joi-browser"
import { t } from "i18next"

export const LoginSchema = {
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .error(errors => {
      errors.forEach(err => {
        if (err.type === "any.empty") {
          err.message = t("Please enter an email!")
        } else if (err.type === "string.email") {
          err.message = t("Please enter a valid email address!")
        }
      })
      return errors
    }),
  password: Joi.string()
    .min(8)
    .required()
    .error(errors => {
      errors.forEach(err => {
        if (err.type === "any.empty") {
          err.message = t("Please enter a password!")
        } else if (err.type === "string.min") {
          err.message = t("Password should be at least 8 characters!")
        }
      })
      return errors
    })
}
