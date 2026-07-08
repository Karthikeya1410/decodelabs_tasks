const http = require("http");
const fs = require("fs");
const path = require("path");

const databasePath = path.join(__dirname, "database.json");

function readDatabase() {
  const content = fs.readFileSync(databasePath, "utf8");
  return JSON.parse(content);
}

function writeDatabase(data) {
  fs.writeFileSync(databasePath, JSON.stringify(data, null, 2));
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

function getInternId(url) {
  const match = url.match(/^\/api\/interns\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return sendJson(res, 200, { message: "OK" });
  }

  if (req.url === "/api/interns" && req.method === "GET") {
    return sendJson(res, 200, readDatabase());
  }

  if (req.url === "/api/interns" && req.method === "POST") {
    try {
      const data = await readBody(req);
      const error = validateIntern(data);

      if (error) {
        return sendJson(res, 400, { error });
      }

      const interns = readDatabase();
      const intern = {
        id: Date.now(),
        name: data.name.trim(),
        email: data.email.trim(),
        skill: data.skill.trim()
      };

      interns.push(intern);
      writeDatabase(interns);
      return sendJson(res, 201, intern);
    } catch (error) {
      return sendJson(res, 400, { error: "Invalid JSON body." });
    }
  }

  const internId = getInternId(req.url);

  if (internId && req.method === "PUT") {
    try {
      const data = await readBody(req);
      const error = validateIntern(data);

      if (error) {
        return sendJson(res, 400, { error });
      }

      const interns = readDatabase();
      const index = interns.findIndex(intern => intern.id === internId);

      if (index === -1) {
        return sendJson(res, 404, { error: "Intern not found." });
      }

      interns[index] = {
        id: internId,
        name: data.name.trim(),
        email: data.email.trim(),
        skill: data.skill.trim()
      };

      writeDatabase(interns);
      return sendJson(res, 200, interns[index]);
    } catch (error) {
      return sendJson(res, 400, { error: "Invalid JSON body." });
    }
  }

  if (internId && req.method === "DELETE") {
    const interns = readDatabase();
    const filtered = interns.filter(intern => intern.id !== internId);

    if (filtered.length === interns.length) {
      return sendJson(res, 404, { error: "Intern not found." });
    }

    writeDatabase(filtered);
    return sendJson(res, 200, { message: "Intern deleted." });
  }

  return sendJson(res, 404, { error: "Route not found." });
});

server.listen(3000, () => {
  console.log("Project 3 API with database running at http://localhost:3000");
});
