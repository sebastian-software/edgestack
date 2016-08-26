export function notEmpty(x, message)
{
  if (x == null)
    throw new Error(message)

  return x
}
