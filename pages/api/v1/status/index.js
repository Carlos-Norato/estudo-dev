import database from "infra/database.js";

async function status(request, response) {
  const result = await database.query("SELECT 1+1 AS soma");
  console.log(result.rows);
  response.status(200).json({ Mensagem: "API está funcionando!" });
}

export default status;
