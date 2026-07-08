const http = require("http");
const fs = require("fs");
const path = require("path");

const databasePath = path.join(__dirname, "database.json");
const publicPath = path.join(__dirname, "public");

function readDatabase() {
  return JSON.parse(fs.readFileSync(databasePath, "utf8"));
}

function writeDatabase(data) {
  fs.writeFileSync(databasePath, JSON.stringify(data, null, 2));
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendFile(res, filePath) {
  const extension = path.extname(filePath);
  const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript"
  };

  fs.readFile(filePath, (error, content) => {
    if (error) {
      return sendJson(res, 404, { error: "File not found." });
    }

    res.writeHead(200, { "Content-Type": types[extension] || "text/plain" });
    res.end(content);
  });
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

  const requestedPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(publicPath, requestedPath);

  if (!filePath.startsWith(publicPath)) {
    return sendJson(res, 403, { error: "Access denied." });
  }

  return sendFile(res, filePath);
});

server.listen(3000, () => {
  console.log("Project 4 full-stack app running at http://localhost:3000");
});
