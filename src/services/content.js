export async function fetchContent(file) {
  const response = await fetch(`${import.meta.env.BASE_URL}content/${file}.json`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
