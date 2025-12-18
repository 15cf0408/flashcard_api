// Generic middleware to validate the body with a Zod schema
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: result.error.flatten().fieldErrors,
    })
  }

  req.validatedBody = result.data
  return next()
}
