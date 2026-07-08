const http = require("http");

let interns = [
  { id: 1, name: "Aarav Sharma", email: "aarav@example.com", skill: "HTML" },
  { id: 2, name: "Priya Verma", email: "priya@example.com", skill: "JavaScript" }
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function validateIntern(data) {
  if (!data.name || !data.email || !data.skill) {
    return "Name, email, and skill are required.";
  }

  if (!data.email.includes("@")) {
    return "A valid email address is required.";
  }

  return "";
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return sendJson(res, 200, { message: "OK" });
  }

  if (req.url === "/api/interns" && req.method === "GET") {
    return sendJson(res, 200, interns);
  }

  if (req.url === "/api/interns" && req.method === "POST") {
    try {
      const data = await readBody(req);
      const error = validateIntern(data);

      if (error) {
        return sendJson(res, 400, { error });
      }

      const intern = {
        id: Date.now(),
        name: data.name.trim(),
        email: data.email.trim(),
        skill: data.skill.trim()
      };

      interns.push(intern);
      return sendJson(res, 201, intern);
    } catch (error) {
      return sendJson(res, 400, { error: "Invalid JSON body." });
    }
  }

  return sendJson(res, 404, { error: "Route not found." });
});

server.listen(3000, () => {
  console.log("Project 2 API running at http://localhost:3000");
});
