// Middleware generique pour valider le body avec un schema Zod
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      message: 'Validation echouee',
      errors: result.error.flatten().fieldErrors,
    })
  }

  req.validatedBody = result.data
  return next()
}
