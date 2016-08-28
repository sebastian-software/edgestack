import fs from "fs"

export function fileExists(filePath, message)
{
  if (!fs.existsSync(filePath))
    throw new Error(message)
}
