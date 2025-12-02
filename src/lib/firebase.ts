// Firebase Realtime Database - usando REST API
const DATABASE_URL = "https://formulario-a515c-default-rtdb.firebaseio.com";

export async function saveFormSubmission(answers: Record<number, string>) {
  const response = await fetch(`${DATABASE_URL}/submissions.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      answers,
      submittedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Erro ao salvar no Firebase");
  }

  return response.json();
}
