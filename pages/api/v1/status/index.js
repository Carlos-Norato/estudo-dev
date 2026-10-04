import database from "/infra/database.js";

async function status(request, response) {
  response.status(200).json({ Mensagem: "API está funcionando!" });
}

export default status;
